import { isAxiosError } from 'axios';

const DEFAULT_SEND_ERROR = 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.';
const DEFAULT_RATE_LIMIT_MESSAGE = 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.';
const TOO_MANY_REQUESTS = 429;

type OtpErrorPayload = {
  message?: unknown;
  remaining_seconds?: unknown;
};

export type OtpSendErrorFeedback = {
  cooldownSeconds: number;
  message: string;
};

/** A verification request the backend refused with 429 for `remaining_seconds`. */
export type OtpRateLimit = {
  cooldownSeconds: number;
  /** The backend message, shown as-is: it already spells out the wait ("3 dakika 55 saniye"). */
  message: string;
};

/** Normalizes the backend's numeric/string cooldown into whole display seconds. */
export function parseOtpCooldownSeconds(value: unknown, fallbackSeconds = 0): number {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number.parseFloat(value.replace(',', '.'))
        : Number.NaN;

  if (!Number.isFinite(numericValue) || numericValue <= 0) return fallbackSeconds;
  return Math.ceil(numericValue);
}

/** Extracts a safe message and cooldown from rejected OTP send-code requests. */
export function getOtpSendErrorFeedback(error: unknown): OtpSendErrorFeedback {
  const candidate = error as {
    message?: unknown;
    response?: { data?: OtpErrorPayload };
  };
  const payload = candidate?.response?.data;
  const cooldownSeconds = parseOtpCooldownSeconds(payload?.remaining_seconds);
  const apiMessage =
    typeof payload?.message === 'string' && payload.message.trim() ? payload.message.trim() : null;

  // The axios error's own text ("Request failed with status code 429") is technical
  // English, so a body without a message falls back to Turkish copy instead.
  return {
    cooldownSeconds,
    message:
      apiMessage ??
      (cooldownSeconds > 0
        ? 'Kodu tekrar göndermek için lütfen bekleyin.'
        : DEFAULT_SEND_ERROR),
  };
}

/**
 * Detects a 429 that carries `remaining_seconds` on any OTP send or verify request
 * (e.g. too many wrong codes). The backend refuses every new code until that window
 * ends, so callers restart the resend countdown with it and show the message untouched.
 */
export function getOtpRateLimit(error: unknown): OtpRateLimit | null {
  if (!isAxiosError<OtpErrorPayload>(error) || error.response?.status !== TOO_MANY_REQUESTS) {
    return null;
  }

  const payload = error.response.data;
  const cooldownSeconds = parseOtpCooldownSeconds(payload?.remaining_seconds);
  if (cooldownSeconds <= 0) return null;

  const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
  return { cooldownSeconds, message: message || DEFAULT_RATE_LIMIT_MESSAGE };
}

/** Renders a remaining OTP cooldown as `MM:SS` for countdown labels. */
export function formatOtpCooldown(totalSeconds: number): string {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}
