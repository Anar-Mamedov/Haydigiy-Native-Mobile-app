import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { MetaClickIdStore, metaClickIdStore } from '../services/meta-click-id-store';

/**
 * Uygulamayı açan ve açıkken gelen bağlantılardaki Meta tıklama kimliğini yakalar
 * (soğuk açılış: `getInitialURL`, sıcak açılış: `url` olayı). İzin seçiminden bağımsız
 * saklanır (iş kararı, bkz. `first-party.sink.ts`). Yönlendirmeye karışmaz; rota
 * çözümü Expo Router ve `resolve-deep-link`'te kalır.
 */
export function useMetaClickIdCapture(store: MetaClickIdStore = metaClickIdStore): void {
  useEffect(() => {
    const capture = async (url: string | null) => {
      if (!url) return;
      try {
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
  }, [store]);
}
