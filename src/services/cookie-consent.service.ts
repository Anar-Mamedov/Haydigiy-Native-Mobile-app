import { apiClient } from '@/lib/axios';
import type { ConsentPreferences, ConsentStatus } from '@/features/consent/types/consent.types';

export type CookieConsentPayload = {
  ccpa_applies: boolean;
  consent_status: ConsentStatus;
  domain: string;
  essential_cookies: boolean;
  gdpr_applies: boolean;
  language: string;
  preferences: ConsentPreferences;
  screen_resolution: string;
  session_id: string;
  timezone: string;
};

/** Records the user's consent choice. Mirrors the web `/cookie-consents` call. */
export async function postCookieConsent(payload: CookieConsentPayload): Promise<void> {
  await apiClient.post('/cookie-consents', payload);
}
