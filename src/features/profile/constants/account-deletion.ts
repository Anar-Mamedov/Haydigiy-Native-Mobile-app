import type { DeactivateAccountVersion } from '@/services/auth.service';

/**
 * Deletion contract the app asks `POST /auth/deactivate` for.
 *
 * `v2` sends an SMS code to the registered phone and only closes the account on
 * the follow-up call. Setting this back to `'v1'` restores the immediate,
 * code-free deletion without touching the screens — the endpoint keeps both
 * versions alive for older app builds.
 */
export const ACCOUNT_DELETION_API_VERSION: DeactivateAccountVersion = 'v2';

/** Digits in the SMS code the backend sends. */
export const ACCOUNT_DELETION_CODE_LENGTH = 6;

/** Backend refuses a new code until this many seconds have passed. */
export const ACCOUNT_DELETION_RESEND_COOLDOWN_SECONDS = 60;
