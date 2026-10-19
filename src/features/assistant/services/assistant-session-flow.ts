import { getAccessToken } from '@/lib/storage/secure-storage';
import {
  ASSISTANT_PLATFORM,
  createAssistantSessionDto,
  getAssistantHistoryDto,
  logoutAssistantSession,
} from '@/services/assistant.service';
import type { BlockIssue } from '../api/assistant-blocks.mapper';
import {
  getActiveAssistantSession,
  useAssistantStore,
  type AssistantSession,
} from '../store/use-assistant-store';
import { classifyAssistantError, isInvalidPlatformError } from '../utils/assistant-errors';
import {
  assistantMessage,
  fallbackMessage,
  markRestored,
  parseHistory,
  parseTurnState,
  textMessage,
} from '../utils/assistant-messages';
import { flushAssistantEvents, trackAssistantClientError, trackAssistantEvent } from './assistant-events';

/**
 * Oturum yaşam döngüsü (README §3, §4.2, §4.5, §4.7). Site token'ı (SecureStore) yalnız `POST /session`'a
 * gider; değeri hiçbir yere yazılmaz, tutarlılık kontrolünde yalnız VARLIĞINA bakılır.
 */
const store = () => useAssistantStore.getState();

export const reportBlockIssues = (issues: BlockIssue[]): void =>
  issues.forEach((issue) => trackAssistantClientError(issue.code, issue.blockId));

export const disableAssistant = (): void => store().disable();

const showSessionFailure = (error: unknown): void => {
  const action = classifyAssistantError(error);
  if (action.type === 'disabled') return disableAssistant();
  if (action.type === 'malformed') trackAssistantClientError('render_error');
  const message =
    'message' in action && action.message ? action.message : (store().config?.fallback.error_text ?? '');
  store().appendMessages([fallbackMessage(message, true)]);
};

const requestSession = async (siteToken: string | null) => {
  try {
    return await createAssistantSessionDto(siteToken);
  } catch (error) {
    if (ASSISTANT_PLATFORM !== 'web' && isInvalidPlatformError(error))
      return createAssistantSessionDto(siteToken, 'web');
    throw error;
  }
};

const toSession = (body: Record<string, unknown>, siteTokenSent: boolean): AssistantSession => {
  const token = typeof body.token === 'string' ? body.token : '';
  if (!token.startsWith('ast_')) throw new Error('malformed session');
  return {
    token,
    sessionId: typeof body.session_id === 'string' ? body.session_id : '',
    expiresAt: typeof body.expires_at === 'string' ? body.expires_at : '',
    authLevel: body.auth_level === 'site_login' ? 'site_login' : 'guest',
    siteTokenSent,
  };
};

export const startSession = async (): Promise<boolean> => {
  const config = store().config;
  if (!config) return false;
  try {
    const siteToken = await getAccessToken();
    const body = (await requestSession(siteToken)) ?? {};
    store().setSession(toSession(body, !!siteToken));
    const state = parseTurnState(body, config);
    reportBlockIssues(state.issues);
    if (state.blocks.length > 0) store().appendMessages([assistantMessage(state.blocks)]);
    store().setTurnState(state.input, state.breadcrumb);
    store().setConversationReady(true);
    return true;
  } catch (error) {
    showSessionFailure(error);
    return false;
  }
};

const restoreHistory = async (session: AssistantSession): Promise<void> => {
  const config = store().config;
  if (!config) return;
  try {
    const parsed = parseHistory(await getAssistantHistoryDto(session.token), config);
    reportBlockIssues(parsed.issues);
    store().updateExpiry(parsed.expiresAt);
    const resume = parsed.resume.blocks.length > 0 ? [assistantMessage(parsed.resume.blocks)] : [];
    store().replaceMessages([...parsed.messages, ...resume]);
    store().setTurnState(parsed.resume.input, parsed.resume.breadcrumb);
    store().setConversationReady(true);
  } catch (error) {
    if (classifyAssistantError(error).type !== 'session_expired') return showSessionFailure(error);
    store().setSession(null);
    await startSession();
  }
};

/**
 * Site oturumu tutarlılığı (README §3 madde 3, kabul 14). Yeni oturum açtıysa `true` döner;
 * çağıran o anki eylemi göndermez (eski oturumun seçenekleri geçersizdir).
 */
export const syncAuthState = async (): Promise<boolean> => {
  const session = getActiveAssistantSession();
  if (!session) return false;
  const hasSiteToken = !!(await getAccessToken());
  if (hasSiteToken && session.authLevel !== 'site_login' && !session.siteTokenSent) {
    logoutAssistantSession(session.token);
    store().setSession(null);
    store().replaceMessages(markRestored(store().messages));
    return startSession();
  }
  if (!hasSiteToken && session.authLevel === 'site_login') {
    // Çıkış yapan müşteri siparişlerini görmeye devam edemez: ekrandaki üye balonları da silinir.
    logoutAssistantSession(session.token);
    store().resetConversation();
    return startSession();
  }
  return false;
};

/** Ekran açılınca: tutarlılık → (henüz yüklenmediyse) geçmiş ya da yeni oturum. */
export const ensureConversation = async (): Promise<void> => {
  if (store().busy || !store().config) return;
  store().setBusy(true);
  try {
    if (await syncAuthState()) return;
    const session = getActiveAssistantSession();
    if (store().conversationReady && session) return;
    if (session) await restoreHistory(session);
    else {
      if (store().conversationReady) store().replaceMessages(markRestored(store().messages));
      store().setConversationReady(false);
      await startSession();
    }
  } finally {
    store().setBusy(false);
  }
};

export const retrySessionStart = async (): Promise<void> => {
  store().replaceMessages(
    store().messages.filter((message) => !(message.role === 'assistant' && message.fallback?.retrySession)),
  );
  await ensureConversation();
};

/** Tamamen kapatma (X): balonlar silinir, oturum sunucuda kapatılır (README §3-d). */
export const closeAssistant = (): void => {
  const session = getActiveAssistantSession();
  if (session) {
    trackAssistantEvent('widget_close', {}, { flushNow: true });
    logoutAssistantSession(session.token);
  }
  store().resetConversation();
  flushAssistantEvents();
};

export const showSessionExpired = async (message: string): Promise<void> => {
  store().setSession(null);
  if (message) store().appendMessages([textMessage(message)]);
  store().setConversationReady(false);
  await startSession();
};
