import { uuidv4 } from '@/utils/uuid';

import {
  normalizeBlocks,
  normalizeBreadcrumb,
  normalizeInput,
  type BlockContext,
  type BlockIssue,
} from '../api/assistant-blocks.mapper';
import type {
  AssistantBlock,
  AssistantConfig,
  AssistantHistoryMessage,
  AssistantMessage,
  AssistantTurnInput,
  AssistantTurnState,
} from '@/types/assistant.types';

/** Sunucu cevaplarını sohbet satırlarına çeviren saf yardımcılar. */

let keySeed = 0;
export const newMessageKey = (): string => `ha-${Date.now().toString(36)}-${(keySeed += 1)}`;

/** Her yeni eylem için yeni UUID v4; yeniden denemede AYNI id kullanılır (README §4.4). */
export const newClientMsgId = (): string => uuidv4();

export const toBlockContext = (config: AssistantConfig): BlockContext => ({
  imageHosts: config.imageHosts,
  videoHosts: config.videoHosts,
  fallbackWhatsappHref: config.fallback.live_support.href,
});

type Raw = Record<string, unknown>;
const asRecord = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});

export const parseTurnState = (
  body: unknown,
  config: AssistantConfig,
): AssistantTurnState & { issues: BlockIssue[] } => {
  const raw = asRecord(body);
  const { blocks, issues } = normalizeBlocks(raw.blocks, toBlockContext(config));
  return {
    input: normalizeInput(raw.input, config.maxText),
    breadcrumb: normalizeBreadcrumb(raw.breadcrumb),
    blocks,
    issues,
  };
};

export const assistantMessage = (blocks: AssistantBlock[], restored = false): AssistantMessage => ({
  key: newMessageKey(),
  role: 'assistant',
  blocks,
  restored,
});

export const textMessage = (text: string): AssistantMessage =>
  assistantMessage([{ type: 'text', id: newMessageKey(), text }]);

export const userMessage = (
  text: string,
  status: 'sent' | 'pending' | 'failed',
  retry?: { clientMsgId: string; input: AssistantTurnInput },
): AssistantMessage => ({
  key: newMessageKey(),
  role: 'user',
  text,
  status,
  retry,
});

export const fallbackMessage = (text: string, retrySession = false): AssistantMessage => ({
  key: newMessageKey(),
  role: 'assistant',
  blocks: [],
  restored: false,
  fallback: { text, retrySession },
});

/** Geri yüklenen ya da eskiyen oturuma ait seçenekler etkisiz çizilir. */
export const markRestored = (messages: AssistantMessage[]): AssistantMessage[] =>
  messages.map((message) => (message.role === 'assistant' ? { ...message, restored: true } : message));

const historyEntry = (
  entry: AssistantHistoryMessage,
  ctx: BlockContext,
  issues: BlockIssue[],
): AssistantMessage | null => {
  if (entry.role === 'user') return entry.text ? userMessage(entry.text, 'sent') : null;
  const normalized = normalizeBlocks(entry.blocks, ctx);
  issues.push(...normalized.issues);
  return normalized.blocks.length > 0 ? assistantMessage(normalized.blocks, true) : null;
};

export const parseHistory = (body: unknown, config: AssistantConfig) => {
  const raw = asRecord(body);
  const ctx = toBlockContext(config);
  const issues: BlockIssue[] = [];
  const entries = (Array.isArray(raw.messages) ? raw.messages : []).map(asRecord).map((entry) => ({
    id: String(entry.id ?? ''),
    role: entry.role === 'user' ? 'user' : 'assistant',
    text: typeof entry.text === 'string' ? entry.text : undefined,
    blocks: Array.isArray(entry.blocks) ? (entry.blocks as AssistantBlock[]) : undefined,
  })) as AssistantHistoryMessage[];
  const messages = entries
    .map((entry) => historyEntry(entry, ctx, issues))
    .filter((entry): entry is AssistantMessage => !!entry);
  const resume = parseTurnState(raw.resume, config);
  const session = asRecord(raw.session);
  return {
    messages,
    resume,
    issues: [...issues, ...resume.issues],
    expiresAt: typeof session.expires_at === 'string' ? session.expires_at : '',
  };
};
