/**
 * Geri bildirim uçlarının hata cevaplarını tek bir modele çevirir (sözleşme v1.0 §4, §5).
 * Zarf: `{ success: false, code, errors? }`. `errors` iletileri sunucuda yazılmış düz metindir.
 */

export type FeedbackErrorKind =
  | 'validation'
  | 'attachment'
  | 'form_outdated'
  | 'in_progress'
  | 'too_many'
  | 'too_large'
  | 'disabled'
  | 'unavailable'
  | 'file_rejected'
  | 'client'
  | 'network';

export type FeedbackApiError = {
  kind: FeedbackErrorKind;
  status: number;
  code: string;
  errors: Record<string, string>;
  /** 429'da beklenecek saniye (başlık yoksa 60). */
  retryAfterSeconds: number;
};

const DEFAULT_RETRY_AFTER_SECONDS = 60;
const FILE_REJECTED_CODES = ['file_type_not_allowed', 'file_invalid', 'file_required'];

type AxiosLikeError = {
  response?: { status?: number; data?: unknown; headers?: Record<string, unknown> };
};

const toErrors = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
    ),
  );
};

const toRetryAfter = (headers: Record<string, unknown> | undefined): number => {
  const seconds = Number(headers?.['retry-after'] ?? headers?.['Retry-After']);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : DEFAULT_RETRY_AFTER_SECONDS;
};

function toKind(status: number, code: string): FeedbackErrorKind {
  if (status === 0) return 'network';
  if (status === 409) return 'in_progress';
  if (status === 413) return code === 'file_too_large' ? 'file_rejected' : 'too_large';
  if (status === 429) return 'too_many';
  if (status === 503) return code === 'disabled' ? 'disabled' : 'unavailable';
  if (status >= 500) return 'unavailable';
  if (status === 422) {
    if (code === 'validation_failed') return 'validation';
    if (code === 'attachment_invalid') return 'attachment';
    if (code === 'form_outdated') return 'form_outdated';
    if (FILE_REJECTED_CODES.includes(code)) return 'file_rejected';
  }
  return 'client';
}

export function toFeedbackApiError(error: unknown): FeedbackApiError {
  const response = (error as AxiosLikeError | null)?.response;
  const status = typeof response?.status === 'number' ? response.status : 0;
  const body = response?.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : {};
  const code = typeof body.code === 'string' ? body.code : '';
  return {
    kind: toKind(status, code),
    status,
    code,
    errors: toErrors(body.errors),
    retryAfterSeconds: status === 429 ? toRetryAfter(response?.headers) : 0,
  };
}
