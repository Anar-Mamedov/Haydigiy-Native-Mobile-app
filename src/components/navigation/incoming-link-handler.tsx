import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

/**
 * Uygulama arka plandayken gelen son dış bağlantıyı mevcut gezinme geçmişinin
 * önüne geçirir. Soğuk açılışları `+native-intent` yönetir; bu bileşen yalnızca
 * çalışan uygulamaya ulaşan URL olaylarını koordine eder.
 */
export function IncomingLinkHandler() {
  const router = useRouter();
  const pendingNavigation = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const target = resolveDeepLinkPath(url) as Href;

      if (pendingNavigation.current) {
        clearTimeout(pendingNavigation.current);
      }

      // Expo Router'ın kendi URL olayını işlemesinden sonra son bağlantıyı
      // kesin hedef yap; böylece eski ürün detay ekranı üstte kalamaz.
      pendingNavigation.current = setTimeout(() => {
        pendingNavigation.current = null;
        router.dismissTo(target);
      }, 0);
    });

    return () => {
      subscription.remove();

      if (pendingNavigation.current) {
        clearTimeout(pendingNavigation.current);
        pendingNavigation.current = null;
      }
    };
  }, [router]);

  return null;
}
