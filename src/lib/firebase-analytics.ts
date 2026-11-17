/* eslint-disable @typescript-eslint/no-require-imports */
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isExpoGoRuntime } from '@/lib/storage/mmkv';

/**
 * Firebase Analytics'in uygulamaya açılan dar yüzü.
 *
 * Analytics feature'ı React Native Firebase'in modüler API'sine ve tiplerine
 * doğrudan bağlanmaz (bağımlılığın tersine çevrilmesi): yalnızca bu arayüzü
 * tanır, testlerde sahte bir istemciyle çalışır, kütüphane değişirse yalnızca
 * bu dosya değişir.
 *
 * Native modül Expo Go'da ve web'de yok. O ortamlarda yükleyici `null` döner,
 * Firebase sink'i de kendini devre dışı sayar; uygulama çökmez (AGENTS.md).
 */

export type FirebaseAnalyticsParams = Record<string, unknown>;

/** Google Consent Mode v2 sinyalleri. */
export type FirebaseConsentSettings = {
  analyticsStorage: boolean;
  adStorage: boolean;
  adUserData: boolean;
  adPersonalization: boolean;
};

export interface FirebaseAnalyticsClient {
  logEvent(name: string, params: FirebaseAnalyticsParams): Promise<void>;
  logScreenView(screenName: string, screenClass: string): Promise<void>;
  setUserId(userId: string | null): Promise<void>;
  setCollectionEnabled(enabled: boolean): Promise<void>;
  setConsent(consent: FirebaseConsentSettings): Promise<void>;
}

type RnFirebaseAnalyticsModule = typeof import('@react-native-firebase/analytics');
type RnFirebaseAnalytics = ReturnType<RnFirebaseAnalyticsModule['getAnalytics']>;

/**
 * Modüler `logEvent`, önerilen her event adı için ayrı aşırı yüklenmiş
 * (`'purchase'`, `'login'` …). Adı çalışma anında seçen bir adaptör bu
 * aşırı yüklemelerden birini derleme anında seçemez; native sözleşme ise
 * hepsi için aynıdır (ad + parametre sözlüğü). Dönüşüm yalnızca bu sınırda yapılır.
 */
type LogAnyEvent = (
  analytics: RnFirebaseAnalytics,
  name: string,
  params: FirebaseAnalyticsParams,
) => unknown;

export function createFirebaseAnalyticsClient(
  module: RnFirebaseAnalyticsModule,
): FirebaseAnalyticsClient {
  const analytics = module.getAnalytics();
  const logAnyEvent = module.logEvent as unknown as LogAnyEvent;

  return {
    async logEvent(name, params) {
      await logAnyEvent(analytics, name, params);
    },

    logScreenView(screenName, screenClass) {
      return module.logScreenView(analytics, {
        screen_class: screenClass,
        screen_name: screenName,
      });
    },

    setUserId(userId) {
      return module.setUserId(analytics, userId);
    },

    setCollectionEnabled(enabled) {
      return module.setAnalyticsCollectionEnabled(analytics, enabled);
    },

    setConsent(consent) {
      return module.setConsent(analytics, {
        ad_personalization: consent.adPersonalization,
        ad_storage: consent.adStorage,
        ad_user_data: consent.adUserData,
        analytics_storage: consent.analyticsStorage,
      });
    },
  };
}

export type FirebaseAnalyticsLoaderDependencies = {
  isNativeRuntime: () => boolean;
  loadModule: () => RnFirebaseAnalyticsModule;
  onError: (message: string, error: unknown) => void;
};

const defaultLoaderDependencies: FirebaseAnalyticsLoaderDependencies = {
  isNativeRuntime: () => Platform.OS !== 'web' && !isExpoGoRuntime(Constants),
  // Expo Go'da native modül olmadığı için içe aktarma koşullu ve tembel.
  loadModule: () => require('@react-native-firebase/analytics') as RnFirebaseAnalyticsModule,
  onError: (message, error) => console.warn(message, error),
};

/**
 * İstemciyi ilk ihtiyaçta bir kez kurar. Native modül yoksa ya da kurulum
 * hata verirse `null` döner ve tekrar denemez: aynı hata her event'te
 * yeniden üretilmesin.
 */
export function createFirebaseAnalyticsLoader(
  dependencies: FirebaseAnalyticsLoaderDependencies = defaultLoaderDependencies,
): () => FirebaseAnalyticsClient | null {
  let resolved = false;
  let client: FirebaseAnalyticsClient | null = null;

  return () => {
    if (resolved) return client;
    resolved = true;

    if (!dependencies.isNativeRuntime()) return null;

    try {
      client = createFirebaseAnalyticsClient(dependencies.loadModule());
    } catch (error) {
      dependencies.onError('[Firebase Analytics] native modül yüklenemedi.', error);
      client = null;
    }

    return client;
  };
}

export const loadFirebaseAnalyticsClient = createFirebaseAnalyticsLoader();
