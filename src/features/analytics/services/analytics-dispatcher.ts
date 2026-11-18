import { AnalyticsConsentGate, analyticsConsentGate } from './analytics-consent';
import { AnalyticsDeviceInfo, getAnalyticsDeviceInfo } from './analytics-device';
import { AnalyticsSession, analyticsSession } from './analytics-session';
import { AnalyticsContext, AnalyticsSink } from './analytics-sink';
import { firebaseAnalyticsSink } from './firebase-analytics.sink';
import { firstPartySink } from './first-party.sink';
import { metaClickIdStore } from './meta-click-id-store';
import { AnalyticsEvent, AnalyticsIdentity } from '../types/analytics.types';
import { ConsentPreferences } from '@/features/consent/types/consent.types';
import { getDeviceId } from '@/lib/storage/device-id';

/**
 * Analytics dağıtıcısı: domain event'ini kayıtlı bütün hedeflere yayar.
 *
 * Tek sorumluluğu yönlendirme ve yalıtım — hangi alanın hangi sağlayıcıda ne
 * isimle karşılandığını bilmez (bu sink'lerin işi), hangi event'in nerede
 * üretildiğini de bilmez (bu çağrı yerlerinin işi). Yeni bir sağlayıcı eklemek
 * `sinks` listesine bir satır eklemektir; çağrı yerleri hiç değişmez.
 */

export interface AnalyticsDispatcher {
  track(event: AnalyticsEvent): void;
  identify(identity: AnalyticsIdentity): void;
  reset(): void;
  /** Kuyruk tutan hedefleri hemen boşaltır (uygulama arka plana alınırken). */
  flush(): void;
  /** Aktif ekranın yolunu bildirir; sonraki event'lerin bağlamına girer. */
  setScreenPath(path: string | null): void;
  /**
   * İzin tercihini günceller. Kayıtlı tercih ayrıca ilk event'te kendiliğinden
   * yüklenir; çağıranın açılışta bir şey tetiklemesi gerekmez.
   */
  applyConsent: AnalyticsConsentGate['apply'];
}

export type AnalyticsDispatcherDependencies = {
  sinks: AnalyticsSink[];
  consent: AnalyticsConsentGate;
  session: AnalyticsSession;
  loadDeviceInfo: () => AnalyticsDeviceInfo;
  loadDeviceId: () => Promise<string>;
  loadMetaClickId: () => Promise<string | null>;
  /**
   * GA4'e uygulamanın kendi stream'inden gönderim etkin mi? Bağlamın
   * `ga4NativeDelivery` alanı buradan gelir; backend bu işaretle çift sayımı önler.
   */
  isGa4NativeDeliveryActive: () => boolean;
  onError: (message: string, error: unknown) => void;
};

const defaultDependencies: AnalyticsDispatcherDependencies = {
  sinks: [firstPartySink, firebaseAnalyticsSink],
  consent: analyticsConsentGate,
  session: analyticsSession,
  loadDeviceInfo: getAnalyticsDeviceInfo,
  loadDeviceId: getDeviceId,
  loadMetaClickId: () => metaClickIdStore.getFbc(),
  // GA4 iletimi Firebase sink'ine ait: native modül varsa işaret konur, backend MP ile tekrar
  // göndermez. Firebase analitik izni yoksa event'i kendisi göndermez; first-party event'i
  // izinden bağımsız gitse de GA4'e MP'den düşmez. Native modül yoksa (Expo Go) işaret düşer,
  // backend MP ile iletir.
  isGa4NativeDeliveryActive: () => firebaseAnalyticsSink.isEnabled(),
  onError: (message, error) => console.warn(message, error),
};

export function createAnalyticsDispatcher(
  dependencies: AnalyticsDispatcherDependencies = defaultDependencies,
): AnalyticsDispatcher {
  let userId: number | null = null;
  let screenPath: string | null = null;

  /**
   * Bağlam çözümü asenkron (kimlikler MMKV'den okunuyor). Çağrı yerleri
   * `await` etmediği için, event'lerin üretildikleri sırada gitmesini bu zincir
   * garanti eder — aksi halde `add_to_cart` ile `purchase_completed` yer
   * değiştirebilirdi.
   */
  let tail: Promise<void> = Promise.resolve();

  /**
   * İzin tercihi depodan asenkron okunuyor, ilk event ise açılış ekranıyla
   * birlikte hemen üretiliyor. Bu söz olmadan varsayılan "izin yok" durumu
   * kazanır ve ilk `screen_viewed` her açılışta sessizce düşerdi.
   */
  let consentReady: Promise<void> | null = null;

  /**
   * İzni kendi tarafında da tutan sink'lere (Firebase toplamayı kapalı başlatır)
   * tercihi iletir. Kategori kapısından bağımsızdır: izin geri alındığında da
   * haber verilmeli ki sağlayıcı toplamayı durdursun.
   */
  const propagateConsent = (preferences: ConsentPreferences): void => {
    dependencies.sinks.forEach((sink) => {
      try {
        sink.applyConsent?.(preferences);
      } catch (error) {
        dependencies.onError(`[Analytics] ${sink.id} izin tercihini alamadı.`, error);
      }
    });
  };

  const ensureConsentReady = (): Promise<void> => {
    if (!consentReady) {
      consentReady = dependencies.consent
        .restore()
        .then(() => propagateConsent(dependencies.consent.current()));
    }
    return consentReady;
  };

  const enqueue = (work: () => Promise<void>): void => {
    tail = tail
      .then(async () => {
        await ensureConsentReady();
        await work();
      })
      .catch((error) => {
        dependencies.onError('[Analytics] event işlenemedi.', error);
      });
  };

  const resolveContext = async (): Promise<AnalyticsContext> => {
    const device = dependencies.loadDeviceInfo();
    // Event'in üretildiği andaki tercih; kayıtlı tercih `enqueue` içinde zaten yüklenmiş olur.
    const marketingConsent = dependencies.consent.isAllowed('marketing');

    return {
      anonymousId: await dependencies.session.getAnonymousId(),
      sessionId: await dependencies.session.getSessionId(),
      userId,
      deviceId: await dependencies.loadDeviceId(),
      screenPath,
      // Meta tıklama kimliği izin seçiminden bağımsız gider (bkz. `first-party.sink.ts`).
      // Eşleştirmeyi güçlendirir ama zorunlu değil; okunamazsa event yine gider.
      metaClickId: await dependencies.loadMetaClickId().catch(() => null),
      marketingConsent,
      ga4NativeDelivery: dependencies.isGa4NativeDeliveryActive(),
      ...device,
    };
  };

  /** Bir hedefin hatası diğerlerini durdurmamalı; her sink ayrı yalıtılır. */
  const forEachEligibleSink = (
    context: AnalyticsContext,
    action: (sink: AnalyticsSink) => void,
  ): void => {
    dependencies.sinks.forEach((sink) => {
      if (!dependencies.consent.isAllowed(sink.consentCategory)) return;
      if (!sink.isEnabled()) return;

      try {
        action(sink);
      } catch (error) {
        dependencies.onError(`[Analytics] ${sink.id} hedefi başarısız oldu.`, error);
      }
    });
  };

  return {
    track(event) {
      enqueue(async () => {
        const context = await resolveContext();
        forEachEligibleSink(context, (sink) => sink.track(event, context));
      });
    },

    identify(identity) {
      // Sonraki event'ler oturum sahibiyle ilişkilenmeli; bağlam hemen güncellenir.
      userId = identity.userId;

      enqueue(async () => {
        const context = await resolveContext();
        forEachEligibleSink(context, (sink) => sink.identify?.(identity, context));
      });
    },

    reset() {
      // Sıra önemli: bekleyen event'ler hâlâ eski kimlikle gitmeli, kimlik sonra düşer.
      enqueue(async () => {
        dependencies.sinks.forEach((sink) => {
          try {
            sink.reset?.();
          } catch (error) {
            dependencies.onError(`[Analytics] ${sink.id} sıfırlanamadı.`, error);
          }
        });
        userId = null;
      });
    },

    flush() {
      enqueue(async () => {
        await Promise.all(
          dependencies.sinks.map(async (sink) => {
            try {
              await sink.flush?.();
            } catch (error) {
              dependencies.onError(`[Analytics] ${sink.id} boşaltılamadı.`, error);
            }
          }),
        );
      });
    },

    setScreenPath(path) {
      screenPath = path;
    },

    applyConsent: (preferences) => {
      // Kullanıcı az önce cevapladı; artık depoyu okumayı beklemek gereksiz.
      consentReady = Promise.resolve();
      dependencies.consent.apply(preferences);
      propagateConsent(preferences);
    },
  };
}

export const analytics = createAnalyticsDispatcher();
