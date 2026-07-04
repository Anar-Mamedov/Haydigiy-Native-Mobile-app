import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Updates from 'expo-updates';

/** Ön plandayken yayınlanan güncellemeleri de yakalamak için periyodik kontrol aralığı. */
export const OTA_CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Headless EAS Update (OTA) watcher mounted once at the app root. Silently
 * downloads a newly published bundle (`eas update --channel production`) as soon
 * as possible — on cold start, whenever the app returns to the foreground, and
 * periodically while it stays in use. It never prompts and never reloads the
 * running app: the downloaded update activates on the next cold start, so an
 * in-progress cart/checkout session is never interrupted. No-ops in Expo Go /
 * dev client where updates are disabled.
 */
export function OtaUpdateWatcher() {
  const checkingRef = useRef(false);

  const downloadIfAvailable = useCallback(async () => {
    if (checkingRef.current) {
      return;
    }
    // OTA yalnızca release build'lerde çalışır; Expo Go / dev client'ta native
    // updates modülü yok ve `isEnabled` koruması Expo Go'da yetmediği için
    // çağrı gürültülü hata fırlatıyor.
    if (__DEV__ || !Updates.isEnabled || Platform.OS === 'web') {
      return;
    }

    checkingRef.current = true;
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
      }
    } catch (error) {
      if ((error as { code?: string })?.code !== 'ERR_NOT_AVAILABLE_IN_DEV_CLIENT') {
        console.error('OTA update check failed:', error);
      }
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Soğuk açılış kontrolü.
    downloadIfAvailable();

    // Uygulama öne geldiğinde kontrol.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        downloadIfAvailable();
      }
    });

    // Kullanım sırasında yayınlanan güncellemeler için periyodik kontrol.
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        downloadIfAvailable();
      }
    }, OTA_CHECK_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [downloadIfAvailable]);

  return null;
}
