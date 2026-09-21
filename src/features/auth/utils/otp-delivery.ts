const DEFAULT_SEND_ERROR = 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.';

type OtpErrorPayload = {
  message?: unknown;
  remaining_seconds?: unknown;
};

export type OtpSendErrorFeedback = {
  cooldownSeconds: number;
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
  const apiMessage = typeof payload?.message === 'string' ? payload.message : null;
  const errorMessage = typeof candidate?.message === 'string' ? candidate.message : null;

  return {
    cooldownSeconds,
    message:
      apiMessage ??
      errorMessage ??
      (cooldownSeconds > 0
        ? 'Kodu tekrar göndermek için lütfen bekleyin.'
        : DEFAULT_SEND_ERROR),
  };
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
