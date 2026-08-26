/**
 * Insider panelindeki Smart Recommender kampanyalarının uygulamadaki karşılıkları.
 *
 * `id`, panelde kampanyanın yanında görünen sayıdır. Kampanya oluşturulmadan önce `null`
 * bırakılır: slot `null` olduğu sürece sorgu hiç çalışmaz, SDK çağrılmaz ve ekranda hiçbir
 * şey render edilmez. Kampanya açıldığında tek yapılacak buraya ID'yi yazmaktır.
 *
 * Her slot farklı bir SDK metodu kullanır; panelde seçilen algoritma da buna uygun olmalı:
 * - `home` / `orderSuccess` → `getSmartRecommendation` (ürün gerektirmeyen algoritmalar)
 * - `productDetail` → `getSmartRecommendationWithProduct` (birlikte alınanlar/görüntülenenler)
 * - `cart` → `getSmartRecommendationWithProductIDs` (en fazla 3 ürün kimliği)
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender
 */
export type InsiderRecommendationSlot = 'home' | 'productDetail' | 'cart' | 'orderSuccess';

export type InsiderRecommendationCampaign = {
  /** Paneldeki kampanya ID'si; kampanya yoksa `null`. */
  id: number | null;
  /** Slider başlığı. */
  title: string;
};

export const INSIDER_RECOMMENDATION_CAMPAIGNS: Record<
  InsiderRecommendationSlot,
  InsiderRecommendationCampaign
> = {
  home: { id: null, title: 'Sana Özel Öneriler' },
  productDetail: { id: null, title: 'Bunlarla Birlikte Alınanlar' },
  cart: { id: null, title: 'Sepetini Tamamla' },
  orderSuccess: { id: null, title: 'Bunlar da İlgini Çekebilir' },
};

export function getInsiderRecommendationCampaign(
  slot: InsiderRecommendationSlot,
): InsiderRecommendationCampaign {
  return INSIDER_RECOMMENDATION_CAMPAIGNS[slot];
}

/** Kampanya panelde tanımlıysa ID'sini, tanımlı değilse `null` döner. */
export function getInsiderRecommendationId(slot: InsiderRecommendationSlot): number | null {
  const id = INSIDER_RECOMMENDATION_CAMPAIGNS[slot]?.id;
  return typeof id === 'number' && id > 0 ? id : null;
}
