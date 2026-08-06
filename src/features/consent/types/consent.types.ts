/**
 * Backend `/cookie-consents` yalnızca bu üç değeri kabul ediyor.
 * Kısmi izin için doğru değer `partial` (`custom` 422 döner).
 */
export type ConsentStatus = 'accepted' | 'partial' | 'rejected';

export type ConsentPreferences = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

export type StoredConsent = {
  preferences: ConsentPreferences;
  status: ConsentStatus;
};

export const NO_CONSENT_PREFERENCES: ConsentPreferences = {
  analytics: false,
  functional: false,
  marketing: false,
};

export const FULL_CONSENT_PREFERENCES: ConsentPreferences = {
  analytics: true,
  functional: true,
  marketing: true,
};
