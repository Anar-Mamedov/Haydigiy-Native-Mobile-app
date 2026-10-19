import { AssistantApiError } from '@/services/assistant.service';

/** Hata kataloğu (README §10): her hata, widget'ın yapacağı TEK bir eyleme çevrilir. */
export type AssistantErrorAction =
  | { type: 'session_expired'; message: string }
  | { type: 'disabled' }
  | { type: 'stale'; message: string; blocks: unknown; breadcrumb: unknown }
  | { type: 'invalid'; message: string }
  | { type: 'rate_limited'; message: string; retryAfter: number }
  | { type: 'malformed' }
  | { type: 'unavailable'; message: string };

const DEFAULT_RETRY_AFTER_SECONDS = 30;

export const classifyAssistantError = (error: unknown): AssistantErrorAction => {
  if (!(error instanceof AssistantApiError)) return { type: 'malformed' };
  if (error.kind === 'malformed') return { type: 'malformed' };
  if (error.kind !== 'http') return { type: 'unavailable', message: '' };

  const message = error.serverMessage;
  switch (error.code) {
    case 'session_expired':
    case 'auth_required':
      return { type: 'session_expired', message };
    case 'assistant_disabled':
      return { type: 'disabled' };
    case 'stale_choice':
      return { type: 'stale', message, blocks: error.body?.blocks, breadcrumb: error.body?.breadcrumb };
    case 'invalid_input':
    case 'text_too_long':
      return { type: 'invalid', message };
    case 'rate_limited':
      return { type: 'rate_limited', message, retryAfter: error.retryAfter || DEFAULT_RETRY_AFTER_SECONDS };
    default:
      return { type: 'unavailable', message };
  }
};

/** Sessiz tek yeniden deneme yalnız ağ hatasında, 5xx'te ve `turn_in_progress`'te; 4xx'te ASLA (README §4.4). */
export const isSilentlyRetryable = (error: unknown): boolean => {
  if (!(error instanceof AssistantApiError)) return false;
  if (error.kind === 'network') return true;
  if (error.kind !== 'http') return false;
  return error.status >= 500 || error.code === 'turn_in_progress';
};

export const isInvalidPlatformError = (error: unknown): boolean =>
  error instanceof AssistantApiError && error.kind === 'http' && error.code === 'invalid_platform';
