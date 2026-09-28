import type { ProfileUpdateVersion } from '@/services/user.service';

/**
 * Profile contract the app asks `PUT /user/profile` for.
 *
 * `v2` sends an SMS code to a new phone number and only saves the profile on the
 * follow-up call that carries the code; any other change is saved at once.
 * Setting this back to `'v1'` restores the code-free update without touching the
 * screens — the endpoint keeps both versions alive for older app builds.
 */
export const PROFILE_UPDATE_API_VERSION: ProfileUpdateVersion = 'v2';

/** Digits in the SMS code the backend sends. */
export const PHONE_CHANGE_CODE_LENGTH = 6;

/** Backend refuses a new code until this many seconds have passed. */
export const PHONE_CHANGE_RESEND_COOLDOWN_SECONDS = 60;

/** How long the backend accepts a code, shown to the user as a reminder. */
export const PHONE_CHANGE_CODE_TTL_MINUTES = 5;
