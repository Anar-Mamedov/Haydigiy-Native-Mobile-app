import { AnalyticsSink } from './analytics-sink';
import { toFirebaseAnalyticsCommand } from './firebase-analytics.mapper';
import { AnalyticsEvent, AnalyticsIdentity } from '../types/analytics.types';
import { ConsentPreferences } from '@/features/consent/types/consent.types';
import { FirebaseAnalyticsClient, loadFirebaseAnalyticsClient } from '@/lib/firebase-analytics';

/**
 * GA4'e uygulamanın kendi iOS/Android stream'lerinden (Firebase Analytics)
 * yazan sink.
 *
 * Measurement Protocol oturum başlangıcı ve trafik kaynağı taşıyamadığı için
 * backend üzerinden giden uygulama oturumları GA4'te "(not set)" görünüyordu.
 * Firebase oturumu, ilk açılışı, cihaz/konum bilgisini ve etkileşim süresini
 * kendisi ölçer.
 *
 * İzin: toplama `firebase.json`'da varsayılan kapalı. Tercih yüklendiğinde ve
 * her değiştiğinde `applyConsent` toplamayı ve Consent Mode sinyallerini
 * günceller; analitik izni yoksa Firebase hiçbir şey kaydetmez.
 */

export type FirebaseAnalyticsSinkDependencies = {
  loadClient: () => FirebaseAnalyticsClient | null;
  onError: (message: string, error: unknown) => void;
};

const defaultDependencies: FirebaseAnalyticsSinkDependencies = {
  loadClient: loadFirebaseAnalyticsClient,
  onError: (message, error) => console.warn(message, error),
};

export function createFirebaseAnalyticsSink(
  dependencies: FirebaseAnalyticsSinkDependencies = defaultDependencies,
): AnalyticsSink {
  /**
   * Native çağrılar asenkron; ister reddedilen söz ister eşzamanlı hata olsun,
   * akışı kırmaz ama sessizce de yutulmaz, teşhis log'a düşer.
   */
  function run(label: string, work: (client: FirebaseAnalyticsClient) => Promise<void>): void {
    const client = dependencies.loadClient();
    if (!client) return;

    Promise.resolve()
      .then(() => work(client))
      .catch((error) => {
        dependencies.onError(`[Analytics] Firebase ${label} başarısız oldu.`, error);
      });
  }

  return {
    id: 'firebase-analytics',
    consentCategory: 'analytics',

    isEnabled() {
      return dependencies.loadClient() !== null;
    },

    track(event: AnalyticsEvent) {
      const command = toFirebaseAnalyticsCommand(event);
      if (!command) return;

      run(event.name, (client) =>
        command.kind === 'screen_view'
          ? client.logScreenView(command.screenName, command.screenClass)
          : client.logEvent(command.name, command.params),
      );
    },

    identify(identity: AnalyticsIdentity) {
      // Backend MP iletimindeki `user_id` ile aynı değer; GA4 kullanıcıyı iki yoldan da birleştirir.
      run('identify', (client) => client.setUserId(String(identity.userId)));
    },

    reset() {
      run('reset', (client) => client.setUserId(null));
    },

    applyConsent(preferences: ConsentPreferences) {
      run('consent', async (client) => {
        await client.setConsent({
          analyticsStorage: preferences.analytics,
          adStorage: preferences.marketing,
          adUserData: preferences.marketing,
          adPersonalization: preferences.marketing,
        });
        await client.setCollectionEnabled(preferences.analytics);
      });
    },
  };
}

export const firebaseAnalyticsSink = createFirebaseAnalyticsSink();
