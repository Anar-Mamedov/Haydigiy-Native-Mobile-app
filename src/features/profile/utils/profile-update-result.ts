import type { UpdateProfileResponseDto } from '@/services/user.service';

/**
 * `true` when the backend sent an SMS code to the new phone number. Nothing is
 * saved at this point: the whole form is saved by the call that carries the code.
 */
export function isPhoneChangeCodeSent(result: UpdateProfileResponseDto | undefined): boolean {
  return result?.verification_required === true;
}

/**
 * The profile is saved as soon as the backend stops asking for a code. A `v1`
 * response (and an older backend that ignores `version`) never carries
 * `verification_required`, so it counts as saved.
 */
export function isProfileUpdateSaved(result: UpdateProfileResponseDto | undefined): boolean {
  if (!result) return true;
  if (result.verification_required === true) return false;

  return result.success !== false;
}

type PhoneChangeErrorPayload = {
  remaining_attempts?: unknown;
  verification_required?: unknown;
};

function getErrorPayload(error: unknown): PhoneChangeErrorPayload | null {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return data && typeof data === 'object' ? (data as PhoneChangeErrorPayload) : null;
}

/** Wrong-code attempts the backend still accepts, or `null` when it did not say. */
export function getRemainingCodeAttempts(error: unknown): number | null {
  const value = getErrorPayload(error)?.remaining_attempts;
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : null;
}

/**
 * `true` when a rejected save still belongs to a pending phone change — e.g. the
 * form was sent again while the backend's resend cooldown was running, so the
 * code already on its way stays valid and the code screen should reopen.
 */
export function isPhoneChangeStillPending(error: unknown): boolean {
  return getErrorPayload(error)?.verification_required === true;
}
