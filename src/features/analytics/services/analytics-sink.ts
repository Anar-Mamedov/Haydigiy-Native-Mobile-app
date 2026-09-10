import { AnalyticsEvent, AnalyticsIdentity } from '../types/analytics.types';
import { ConsentPreferences } from '@/features/consent/types/consent.types';

/**
 * Bir analytics hedefinin (kendi collector'ımız, GA4, Meta …) uyması gereken
 * sözleşme. Dispatcher yalnızca bu soyutlamayı tanır; hiçbir sağlayıcının
 * somut tipine bağımlı değildir.
 *
 * Sözleşme kasten dar: bir sink event alır, kendi şemasına çevirir, gönderir.
 * Kuyruklama/batch'leme gibi ihtiyaçlar sink'in kendi içindedir çünkü her
 * sağlayıcının limitleri farklıdır.
 */
export interface AnalyticsSink {
  /** Teşhis günlüklerinde ve testlerde hedefi ayırt etmek için. */
  readonly id: string;

  /**
   * KVKK/GDPR kategorisi. Kullanıcı bu kategoriye izin vermediyse dispatcher
   * sink'i hiç çağırmaz. Ölçüm hedefleri `analytics`, reklam/dönüşüm hedefleri
   * `marketing` olmalıdır.
   */
  readonly consentCategory: keyof ConsentPreferences;

  /**
   * Hedef bu çalışma ortamında kullanılabilir mi (yapılandırma tanımlı mı,
   * native modül yüklü mü). `false` dönerse dispatcher sink'i atlar; bu bir
   * hata değil, beklenen bir durumdur (Expo Go, eksik env).
   */
  isEnabled(): boolean;

  track(event: AnalyticsEvent, context: AnalyticsContext): void;

  /** Oturum açıldığında kimliği bağlar. Kimlik gerektirmeyen sink'ler uygulamaz. */
  identify?(identity: AnalyticsIdentity, context: AnalyticsContext): void;

  /** Oturum kapandığında kimliği düşürür. */
  reset?(): void;

  /**
   * Kuyruktakileri hemen gönderir. Uygulama arka plana alınırken çağrılır;
   * kuyruk tutmayan sink'ler uygulamaz.
   */
  flush?(): void | Promise<void>;
}

/**
 * Her event'e eşlik eden, event'ten bağımsız bağlam. Sink'ler ihtiyaç duyduğu
 * alanı seçer (arayüz ayrımı: kimse kullanmadığı alanı taşımak zorunda değil).
 */
export type AnalyticsContext = {
  anonymousId: string;
  sessionId: string;
  /** Oturum açıksa backend kullanıcı kimliği, değilse null. */
  userId: number | null;
  /** Kalıcı kurulum kimliği; misafir sepetiyle aynı değer. */
  deviceId: string;
  deviceType: 'mobile' | 'tablet';
  os: 'iOS' | 'Android' | 'Other';
  osVersion: string;
  appVersion: string;
  screenWidth: number;
  screenHeight: number;
  /** Aktif ekranın yolu; web'deki `page_url` karşılığı. */
  screenPath: string | null;
};
