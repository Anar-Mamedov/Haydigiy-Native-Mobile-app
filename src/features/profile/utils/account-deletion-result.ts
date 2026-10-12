import type { DeactivateAccountResponse } from '@/services/auth.service';

/**
 * The account is closed as soon as the backend stops asking for a verification
 * code. A `v1` response (and an older backend that ignores the `version` field
 * altogether) never carries `verification_required`, so it counts as completed —
 * which is what keeps the client safe if it ever talks to a pre-`v2` deployment.
 */
export function isAccountDeletionCompleted(result: DeactivateAccountResponse | undefined): boolean {
  if (!result) return true;
  if (result.verification_required === true) return false;

  return result.success !== false;
}

/**
 * `true` when the backend confirms an SMS code is on its way, so the UI can move
 * on to the code screen.
 */
export function isAccountDeletionCodeSent(result: DeactivateAccountResponse | undefined): boolean {
  return result?.verification_required === true;
}

/**
 * `true` when a rejected request still belongs to a pending deletion: it was sent
 * again inside the resend window, so the code already sent stays valid and the code
 * screen should open with the backend's countdown instead of an error.
 */
export function isAccountDeletionStillPending(error: unknown): boolean {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return Boolean(data && typeof data === 'object' && isAccountDeletionCodeSent(data as DeactivateAccountResponse));
}
