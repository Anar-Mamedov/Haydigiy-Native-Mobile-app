import { useAnalyticsFlushOnBackground } from '../hooks/use-analytics-flush-on-background';
import { useAnalyticsIdentityRestore } from '../hooks/use-analytics-identity-restore';
import { useAnalyticsScreenTracking } from '../hooks/use-analytics-screen-tracking';

/**
 * Analytics'in uygulama kökündeki tek bağlanma noktası (web `Providers`
 * paritesi): rota değişimlerini ölçer, kalıcı oturumu kimliğe bağlar ve arka
 * plana geçişte kuyruğu boşaltır.
 *
 * İzin tercihi burada yüklenmez — dispatcher ilk event'i kayıtlı tercih
 * okunana kadar bekletir, böylece bu bileşen hiç mount edilmese bile izinsiz
 * ölçüm yapılamaz.
 *
 * Web'deki tıklama ısı haritası, scroll derinliği ve exit-intent ölçümleri
 * bilinçli olarak taşınmadı; üçü de fare/DOM olayına dayanıyor ve native'de
 * karşılığı yok.
 */
export function AnalyticsIntegration() {
  useAnalyticsIdentityRestore();
  useAnalyticsScreenTracking();
  useAnalyticsFlushOnBackground();

  return null;
}
