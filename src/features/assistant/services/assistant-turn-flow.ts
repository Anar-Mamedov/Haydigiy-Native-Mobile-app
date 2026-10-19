import { sendAssistantTurnDto } from '@/services/assistant.service';
import type { AssistantTurnInput } from '@/types/assistant.types';
import { normalizeBlocks, normalizeBreadcrumb } from '../api/assistant-blocks.mapper';
import { getActiveAssistantSession, useAssistantStore } from '../store/use-assistant-store';
import { classifyAssistantError, isSilentlyRetryable } from '../utils/assistant-errors';
import {
  assistantMessage,
  fallbackMessage,
  newClientMsgId,
  parseTurnState,
  textMessage,
  toBlockContext,
  userMessage,
} from '../utils/assistant-messages';
import { trackAssistantClientError } from './assistant-events';
import {
  disableAssistant,
  reportBlockIssues,
  showSessionExpired,
  startSession,
  syncAuthState,
} from './assistant-session-flow';

/**
 * Müşterinin bir eylemi → `POST /turn` (README §4.3, §4.4, §10). Aynı anda tek istek; müşteri balonu
 * iyimser çizilir; "Tekrar dene" AYNI `client_msg_id` ile gider; sessiz yeniden deneme en çok 1 kez.
 */
const store = () => useAssistantStore.getState();
const SILENT_RETRY_DELAY_MS = 2000;

type RetryInfo = { clientMsgId: string; input: AssistantTurnInput };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithSilentRetry = async (token: string, clientMsgId: string, input: AssistantTurnInput) => {
  try {
    return await sendAssistantTurnDto(token, clientMsgId, input);
  } catch (error) {
    if (!isSilentlyRetryable(error)) throw error;
    await wait(SILENT_RETRY_DELAY_MS);
    return sendAssistantTurnDto(token, clientMsgId, input);
  }
};

const applySuccess = (key: string, body: Record<string, unknown> | null): void => {
  const config = store().config;
  if (!config || !body) throw new Error('malformed turn');
  store().updateMessage(key, { status: 'sent', retry: undefined });
  const state = parseTurnState(body, config);
  reportBlockIssues(state.issues);
  if (state.blocks.length > 0) store().appendMessages([assistantMessage(state.blocks)]);
  store().setTurnState(state.input, state.breadcrumb);
  const session = body.session as { expires_at?: unknown } | undefined;
  if (typeof session?.expires_at === 'string') store().updateExpiry(session.expires_at);
};

const appendStale = (key: string, message: string, rawBlocks: unknown, rawBreadcrumb: unknown) => {
  const config = store().config;
  if (!config) return;
  const { blocks, issues } = normalizeBlocks(rawBlocks, toBlockContext(config));
  reportBlockIssues(issues);
  const intro = message ? [{ type: 'text' as const, id: `${key}-stale`, text: message }] : [];
  store().appendMessages([assistantMessage([...intro, ...blocks])]);
  store().setTurnState(null, normalizeBreadcrumb(rawBreadcrumb));
};

const applyFailure = async (key: string, error: unknown, retry: RetryInfo): Promise<void> => {
  const fallbackText = store().config?.fallback.error_text ?? '';
  const action = classifyAssistantError(error);
  const markFailed = () => store().updateMessage(key, { status: 'failed', retry });
  const markSent = () => store().updateMessage(key, { status: 'sent', retry: undefined });
  switch (action.type) {
    case 'disabled':
      return disableAssistant();
    case 'session_expired':
      markSent();
      return showSessionExpired(action.message);
    case 'stale':
      markSent();
      return appendStale(key, action.message, action.blocks, action.breadcrumb);
    case 'invalid':
      store().replaceMessages(store().messages.filter((message) => message.key !== key));
      if (retry.input.type === 'text') store().setDraft(retry.input.text);
      return action.message ? store().appendMessages([textMessage(action.message)]) : undefined;
    case 'rate_limited':
      markFailed();
      store().lockInput(action.retryAfter);
      return action.message ? store().appendMessages([textMessage(action.message)]) : undefined;
    case 'malformed':
      trackAssistantClientError('render_error');
      markFailed();
      return store().appendMessages([fallbackMessage(fallbackText)]);
    default:
      trackAssistantClientError('network');
      markFailed();
      return store().appendMessages([fallbackMessage(action.message || fallbackText)]);
  }
};

const runTurn = async (
  input: AssistantTurnInput,
  label: string,
  retryOf?: { key: string; clientMsgId: string },
) => {
  if (await syncAuthState()) return;
  const session = getActiveAssistantSession();
  if (!session) {
    await startSession();
    return;
  }
  const clientMsgId = retryOf?.clientMsgId ?? newClientMsgId();
  let key = retryOf?.key;
  if (key) store().updateMessage(key, { status: 'pending' });
  else {
    const message = userMessage(label, 'pending', { clientMsgId, input });
    key = message.key;
    store().appendMessages([message]);
  }
  try {
    applySuccess(key, await sendWithSilentRetry(session.token, clientMsgId, input));
  } catch (error) {
    await applyFailure(key, error, { clientMsgId, input });
  }
};

const guarded = async (task: () => Promise<void>): Promise<void> => {
  const state = store();
  if (state.busy || !state.config || state.disabled || Date.now() < state.lockedUntil) return;
  state.setBusy(true);
  try {
    await task();
  } finally {
    store().setBusy(false);
  }
};

/** Düğme / sipariş kartı / konum yolu seçimi: id ve payload AYNEN geri gönderilir (kural 4). */
export const selectAssistantOption = (id: string, payload: string, label: string): Promise<void> =>
  guarded(() => runTurn({ type: 'select', id, payload }, label));

export const sendAssistantText = (rawText: string): Promise<void> => {
  const text = rawText.trim().slice(0, store().config?.maxText ?? 500);
  if (!text) return Promise.resolve();
  return guarded(() => runTurn({ type: 'text', text }, text));
};

export const retryAssistantMessage = (key: string): Promise<void> => {
  const message = store().messages.find((entry) => entry.key === key);
  if (!message || message.role !== 'user' || !message.retry) return Promise.resolve();
  const { clientMsgId, input } = message.retry;
  return guarded(() => runTurn(input, message.text, { key, clientMsgId }));
};
