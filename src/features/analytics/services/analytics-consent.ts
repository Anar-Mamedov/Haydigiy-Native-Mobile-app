import { readStoredConsent } from '@/features/consent/services/consent-storage';
import {
  ConsentPreferences,
  NO_CONSENT_PREFERENCES,
} from '@/features/consent/types/consent.types';

/**
 * Bir analytics hedefinin çalışması için gereken izin: bir izin kategorisi ya da
 * `'none'` (izinden bağımsız). `'none'` yalnızca bilinçli bir iş kararıyla verilir
 * (bkz. `first-party.sink.ts`).
 */
export type AnalyticsConsentRequirement = keyof ConsentPreferences | 'none';

/**
 * Analytics'in KVKK kapısı. Dispatcher her sink'i, o sink'in bildirdiği izin
 * açık değilse hiç çağırmaz.
 *
 * Varsayılan **izin yok**: kullanıcı çerez sayfasını henüz cevaplamadıysa izin isteyen
 * hiçbir hedefe event gitmez (izin öncesi ölçüm yapmama, prior consent). İstisna,
 * izinden bağımsız çalışan (`'none'`) hedeflerdir.
 */

export interface AnalyticsConsentGate {
  /** Uygulama açılışında kayıtlı tercihi belleğe alır. */
  restore(): Promise<void>;
  /** Kullanıcı tercihini değiştirdiğinde çağrılır. */
  apply(preferences: ConsentPreferences): void;
  isAllowed(requirement: AnalyticsConsentRequirement): boolean;
  /** Bellekteki tercihin kopyası; izni kendi tarafında da tutan sink'lere iletilir. */
  current(): ConsentPreferences;
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

    isAllowed(requirement) {
      if (requirement === 'none') return true;
      return preferences[requirement] === true;
    },

    current() {
      return { ...preferences };
    },
  };
}

export const analyticsConsentGate = createAnalyticsConsentGate();
