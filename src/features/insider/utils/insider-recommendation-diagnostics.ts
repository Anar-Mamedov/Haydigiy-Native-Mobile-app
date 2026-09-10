import { InsiderPayload } from '../types/insider.types';
import { InsiderRecommendation } from './insider-recommendation.mapper';

/**
 * Smart Recommender teşhis günlüğü.
 *
 * "Öneri slider'ı görünmüyor" şikâyeti birbirinden bağımsız beş nedenden gelebilir
 * ve dışarıdan hepsi birebir aynı görünür, çünkü slider boş sonuçta hiç çizilmez:
 *
 * 1. Native SDK yok (Expo Go) → istek hiç yapılmaz.
 * 2. Callback zamanında gelmez → zaman aşımı (`onError` kanalında raporlanır).
 * 3. Insider `success: false` döner → kampanya yayında değil ya da ön koşul eksik.
 * 4. Kampanya panelde `details: false` ile kurulmuş → yanıt yalnızca kimlik listesi
 *    taşır; ad/görsel/fiyat gelmediği için slider çizilemez.
 * 5. Yanıt geçerli ama boş → algoritma-metot uyuşmazlığı, feed'de eşleşen ürün yok
 *    ya da kişiselleştirme verisi henüz birikmemiş.
 *
 * Bu modül beş durumu tek satırlık log'lara çevirir; cihaz log'una bakan kişi hangi
 * kampanyanın neden boş kaldığını ayırt edebilir ve çıktıyı olduğu gibi Insider
 * ekibine iletebilir.
 *
 * Yanıttaki `types` alanı kampanyayı hangi algoritmanın karşıladığını gösteren
 * kısaltmaları taşır (ör. `mpop`); paneldeki algoritma ile çağırdığımız metodun
 * uyuşup uyuşmadığı ancak bu değerle doğrulanabilir, bu yüzden log'a yazılır.
 *
 * PII taşımaz: yalnızca kampanya kimliği, sayılar ve algoritma kısaltmaları yazılır.
 * Ürün adı, ürün kimliği, kullanıcı bilgisi ve yanıt gövdesi loglanmaz.
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender
 */

const LOG_PREFIX = '[Insider] öneri';

/** Ham yanıt log'unun çıkışı; testlerde enjekte edilebilsin diye ayrıldı. */
export interface InsiderRecommendationLogSink {
  log: (label: string, body: unknown) => void;
}

const defaultRawSink: InsiderRecommendationLogSink = {
  log: (label, body) => console.log(label, body),
};

export type InsiderRecommendationRequestLog = {
  recommendationId: number;
  /** Çağrılan SDK metodunun adı. */
  method: string;
  /** SDK'ya gönderilen parametreler (ürün nesnesi yerine özet değerler). */
  params: Record<string, unknown>;
  payload: InsiderPayload | null | undefined;
};

/**
 * Ham Smart Recommender yanıtını geliştirme modunda tek log'da basar.
 *
 * Biçim `lib/axios.ts` içindeki `🔵 API ...` logger'ıyla kasten aynı: istek ve yanıt
 * tek satırda birleşir, böylece backend çağrılarıyla aynı akış içinde okunabilir.
 *
 * Etiket `API` kelimesiyle başlar — React Native DevTools konsolunda backend çağrıları
 * için kullanılan `API` filtresi Insider çağrılarını da yakalasın diye. Ayırt edici
 * kısım mor daire ve `INSIDER` sözcüğüdür.
 *
 * Yalnızca `__DEV__` altında çalışır. Yanıt gövdesi ürün adı, görsel ve fiyat taşıdığı
 * için üretim log'una yazılmaz; üretimde `describeInsiderRecommendationResponse`
 * özetinin PII taşımayan tek satırı kalır.
 */
export function logInsiderRecommendationPayload(
  entry: InsiderRecommendationRequestLog,
  sink: InsiderRecommendationLogSink = defaultRawSink,
): void {
  if (!__DEV__) return;

  sink.log(`🟣 API INSIDER ${entry.method} · kampanya=${entry.recommendationId}`, {
    request: entry.params,
    response: entry.payload,
  });
}

/** İstek hiç yapılmadığında; `reason` neden atlandığını söyler. */
export function describeInsiderRecommendationSkip(
  recommendationId: number,
  reason: string,
): string {
  return `${LOG_PREFIX} isteği atlandı (${reason}) · kampanya=${recommendationId}`;
}

/**
 * Yanıt gövdesinin loglanabilir özeti: kaç sonuç döndüğü (`total`) ve hangi
 * algoritmaların kaç ürünle katkı verdiği (`types`). İkisi de kampanya seviyesinde
 * bilgidir, kişisel veri içermez.
 */
function describeResponseMeta(payload: InsiderPayload): string {
  const parts: string[] = [];

  if (typeof payload.total === 'number' && Number.isFinite(payload.total)) {
    parts.push(`total=${payload.total}`);
  }

  const types = payload.types;
  if (types && typeof types === 'object' && !Array.isArray(types)) {
    const summary = Object.entries(types as Record<string, unknown>)
      .map(([key, value]) => (typeof value === 'number' ? `${key}:${value}` : key))
      .join(' ');
    if (summary) parts.push(`types=${summary}`);
  }

  return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
}

/**
 * Callback'e düşen yanıtın tek satırlık özeti.
 *
 * `recommendation` ham yanıtın çözülmüş hâlidir: ürün nesnesi gelmediğinde
 * `productIds` dolu kalır ve bu, kampanyanın `details: false` ile kurulduğunu
 * gösteren tek sinyaldir.
 */
export function describeInsiderRecommendationResponse(
  recommendationId: number,
  payload: InsiderPayload | null | undefined,
  recommendation: InsiderRecommendation,
): string {
  const head = `${LOG_PREFIX} yanıtı · kampanya=${recommendationId}`;

  if (!payload || typeof payload !== 'object') return `${head} · yanıt okunamadı`;
  if (payload.success === false) return `${head} · boş (success=false)`;

  const meta = describeResponseMeta(payload);

  if (recommendation.products.length > 0) {
    return `${head} · ${recommendation.products.length} ürün${meta}`;
  }

  if (recommendation.productIds.length > 0) {
    return (
      `${head} · ürün yok · ${recommendation.productIds.length} kimlik ` +
      `(details=false, uygulama bu biçimi çizemiyor)${meta}`
    );
  }

  return `${head} · boş yanıt${meta}`;
}
