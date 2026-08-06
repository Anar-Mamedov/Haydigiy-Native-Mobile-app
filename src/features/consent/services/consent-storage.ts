import { appStorage } from '@/lib/storage/mmkv';
import {
  ConsentPreferences,
  ConsentStatus,
  NO_CONSENT_PREFERENCES,
  StoredConsent,
} from '../types/consent.types';

const STATUS_KEY = 'consent.status';
const PREFERENCES_KEY = 'consent.preferences';

const VALID_STATUSES: ConsentStatus[] = ['accepted', 'partial', 'rejected'];

function parsePreferences(raw: string | null): ConsentPreferences {
  if (!raw) return NO_CONSENT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw);
    return {
      analytics: Boolean(parsed?.analytics),
      functional: Boolean(parsed?.functional),
      marketing: Boolean(parsed?.marketing),
    };
  } catch {
    return NO_CONSENT_PREFERENCES;
  }
}

/**
 * Reads the stored choice. Returns null when the user has never answered, which
 * is what makes the consent sheet show on first launch.
 *
 * Non-sensitive preference data, so MMKV (not SecureStore) is the right place.
 */
export async function readStoredConsent(): Promise<StoredConsent | null> {
  const status = await appStorage.getItem(STATUS_KEY);
  if (!status || !VALID_STATUSES.includes(status as ConsentStatus)) return null;

  return {
    preferences: parsePreferences(await appStorage.getItem(PREFERENCES_KEY)),
    status: status as ConsentStatus,
  };
}

export async function writeStoredConsent(consent: StoredConsent): Promise<void> {
  await appStorage.setItem(STATUS_KEY, consent.status);
  await appStorage.setItem(PREFERENCES_KEY, JSON.stringify(consent.preferences));
}
