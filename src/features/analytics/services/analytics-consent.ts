import { readStoredConsent } from '@/features/consent/services/consent-storage';
import {
  ConsentPreferences,
  NO_CONSENT_PREFERENCES,
} from '@/features/consent/types/consent.types';

/**
 * Analytics'in KVKK kapısı. Dispatcher her sink'i, o sink'in bildirdiği izin
 * kategorisi açık değilse hiç çağırmaz.
 *
 * Varsayılan **izin yok**: kullanıcı çerez sayfasını henüz cevaplamadıysa hiçbir
 * event gitmez. Bu, izin öncesi ölçüm yapmama (prior consent) modelidir.
 */

export interface AnalyticsConsentGate {
  /** Uygulama açılışında kayıtlı tercihi belleğe alır. */
  restore(): Promise<void>;
  /** Kullanıcı tercihini değiştirdiğinde çağrılır. */
  apply(preferences: ConsentPreferences): void;
  isAllowed(category: keyof ConsentPreferences): boolean;
}

export function createAnalyticsConsentGate(
  loadStoredConsent: typeof readStoredConsent = readStoredConsent,
): AnalyticsConsentGate {
  let preferences: ConsentPreferences = NO_CONSENT_PREFERENCES;

  return {
    async restore() {
      try {
        const stored = await loadStoredConsent();
        // Cevap yoksa izin de yok; varsayılanı bilinçli olarak korur.
        preferences = stored?.preferences ?? NO_CONSENT_PREFERENCES;
      } catch {
        // Depo okunamazsa ölçüm yapmamak, izinsiz ölçmekten iyidir.
        preferences = NO_CONSENT_PREFERENCES;
      }
    },

    apply(next) {
      preferences = next;
    },

    isAllowed(category) {
      return preferences[category] === true;
    },
  };
}

export const analyticsConsentGate = createAnalyticsConsentGate();
