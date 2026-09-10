import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { analytics } from '../services/analytics-dispatcher';

/**
 * Rota değişimini `screen_viewed` event'ine çevirir (web `Providers` içindeki
 * `trackPageView()` paritesi) ve sonraki bütün event'lerin bağlamına aktif
 * ekranın yolunu yazar.
 *
 * Ekranlar bu hook'u tek tek çağırmaz: tek bir kök bağlanma noktası bütün
 * rotaları kapsar, böylece yeni bir ekran eklenirken ölçüm unutulamaz.
 */
export function useAnalyticsScreenTracking(): void {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Aynı yola yeniden render aynı ziyaret sayılır; yalnızca gerçek geçiş sayılır.
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Sıra önemli: yol önce bağlama yazılır, event o bağlamla gider.
    analytics.setScreenPath(pathname);
    analytics.track({ name: 'screen_viewed', screen: pathname });
  }, [pathname]);
}
