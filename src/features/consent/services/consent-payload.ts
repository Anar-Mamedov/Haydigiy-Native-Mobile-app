import { Dimensions } from 'react-native';
import { getDeviceId } from '@/lib/storage/device-id';
import type { CookieConsentPayload } from '@/services/cookie-consent.service';
import type { ConsentPreferences, ConsentStatus } from '../types/consent.types';

/** Web ile aynı kayıt altında toplanması için aynı domain gönderiliyor. */
const CONSENT_DOMAIN = 'haydigiytr.com';
const FALLBACK_TIMEZONE = 'Europe/Istanbul';
const FALLBACK_LANGUAGE = 'tr-TR';

function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

function resolveLanguage(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || FALLBACK_LANGUAGE;
  } catch {
    return FALLBACK_LANGUAGE;
  }
}

function resolveScreenResolution(): string {
  const { height, width } = Dimensions.get('screen');
  return `${Math.round(width)}x${Math.round(height)}`;
}

/**
 * Builds the `/cookie-consents` payload. `session_id` reuses the existing
 * per-install device id so a consent record can be tied to the same install.
 */
export async function buildConsentPayload(
  status: ConsentStatus,
  preferences: ConsentPreferences,
): Promise<CookieConsentPayload> {
  return {
    ccpa_applies: false,
    consent_status: status,
    domain: CONSENT_DOMAIN,
    essential_cookies: true,
    gdpr_applies: true,
    language: resolveLanguage(),
    preferences,
    screen_resolution: resolveScreenResolution(),
    session_id: await getDeviceId(),
    timezone: resolveTimezone(),
  };
}
