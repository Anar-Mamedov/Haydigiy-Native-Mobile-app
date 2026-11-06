/** Digits in the e-mail code the backend sends (`POST /auth/send-code`, type `email`). */
export const EMAIL_VERIFICATION_CODE_LENGTH = 6;

/** Backend refuses a new code until this many seconds have passed. */
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

/** How long the backend accepts an e-mail code, shown to the user as a reminder. */
export const EMAIL_VERIFICATION_CODE_TTL_MINUTES = 3;
