const FALLBACK_MESSAGE = 'Bilgiler güncellenirken bir hata oluştu.';

export interface ProfileUpdateErrorDetails {
  message: string;
  phoneMessage: string | null;
}

function getFirstString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!Array.isArray(value)) return null;
  return value.find((item): item is string => typeof item === 'string' && item.trim() !== '') ?? null;
}

/** Maps the profile endpoint's validation response to form-friendly messages. */
export function parseProfileUpdateError(error: unknown): ProfileUpdateErrorDetails {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;
  if (!responseData || typeof responseData !== 'object') {
    return { message: FALLBACK_MESSAGE, phoneMessage: null };
  }

  const data = responseData as { errors?: unknown; message?: unknown };
  const errors =
    data.errors && typeof data.errors === 'object'
      ? (data.errors as Record<string, unknown>)
      : null;
  const phoneMessage = getFirstString(errors?.phone);
  const message = getFirstString(data.message) ?? phoneMessage ?? FALLBACK_MESSAGE;

  return { message, phoneMessage };
}
