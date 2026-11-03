import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { readStoredConsent } from '@/features/consent/services/consent-storage';
import { MetaClickIdStore, metaClickIdStore } from '../services/meta-click-id-store';

/**
 * Pazarlama onayı var mı? Kayıtlı tercih doğrudan okunur; analytics izin kapısının
 * belleğine dokunulmaz (o kapıyı dispatcher yönetir).
 */
async function hasStoredMarketingConsent(): Promise<boolean> {
  return (await readStoredConsent())?.preferences?.marketing === true;
}

/**
 * Uygulamayı açan ve açıkken gelen bağlantılardaki Meta tıklama kimliğini yakalar
 * (soğuk açılış: `getInitialURL`, sıcak açılış: `url` olayı). Reklam tanımlayıcısı
 * olduğu için yalnızca pazarlama onayı varken saklanır. Yönlendirmeye karışmaz; rota
 * çözümü Expo Router ve `resolve-deep-link`'te kalır.
 */
export function useMetaClickIdCapture(
  store: MetaClickIdStore = metaClickIdStore,
  isMarketingAllowed: () => Promise<boolean> = hasStoredMarketingConsent,
): void {
  useEffect(() => {
    const capture = async (url: string | null) => {
      if (!url) return;
      try {
        if (!(await isMarketingAllowed())) return;
        await store.capture(url);
      } catch (error) {
        console.warn('[Analytics] Meta tıklama kimliği saklanamadı.', error);
      }
    };

    Linking.getInitialURL()
      .then(capture)
      .catch(() => undefined);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void capture(url);
    });

    return () => subscription.remove();
  }, [store, isMarketingAllowed]);
}
