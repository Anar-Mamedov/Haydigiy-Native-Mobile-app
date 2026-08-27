/**
 * Insider panelindeki Smart Recommender kampanyalarının uygulamadaki karşılıkları.
 *
 * `id`, panelde kampanyanın yanında görünen sayıdır. Bir ekranda birden fazla kampanya
 * olabilir; her kampanya kendi başlığı ve kendi SDK metoduyla ayrı bir slider olarak çizilir.
 *
 * `method`, kampanyanın panelde seçilen algoritmasının hangi SDK metodunu gerektirdiğini
 * söyler — ekran değil kampanya belirler, çünkü aynı ekranda iki farklı algoritma olabilir:
 *
 * - `byId` → `getSmartRecommendation`. Ürün gerektirmeyen algoritmalar: Top Sellers,
 *   Most Popular Items, Trending Products, Highest Discounted, New Arrivals,
 *   Most Valuable Products, User-Based, Purchased with Last Purchased.
 * - `byProduct` → `getSmartRecommendationWithProduct`. Ürün bağlamı isteyen algoritmalar:
 *   Purchased Together, Viewed Together, Recently Viewed ve yukarıdakilerin çoğu.
 * - `byProductIds` → `getSmartRecommendationWithProductIDs`. Yalnızca Purchased Together ve
 *   Viewed Together; en fazla 3 ürün kimliği gönderilir.
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender
 */
export type InsiderRecommendationSlot = 'home' | 'productDetail' | 'cart' | 'orderSuccess';

export type InsiderRecommendationMethod = 'byId' | 'byProduct' | 'byProductIds';

export type InsiderRecommendationCampaign = {
  /** Paneldeki kampanya ID'si. */
  id: number;
  /** Slider başlığı (müşteriye görünen metin). */
  title: string;
  /** Kampanyanın algoritmasının gerektirdiği SDK metodu. */
  method: InsiderRecommendationMethod;
};

/**
 * Panelde tanımlı kampanyalar (2026-08-26 itibarıyla 7 aktif kampanya).
 * Yeni kampanya eklemek ya da kaldırmak için yalnızca bu liste güncellenir.
 */
export const INSIDER_RECOMMENDATION_CAMPAIGNS: Record<
  InsiderRecommendationSlot,
  InsiderRecommendationCampaign[]
> = {
  productDetail: [
    // Panel: "Ürün Detay 1 | Birlikte Satın Alınanlar" → Purchased Together
    { id: 1, title: 'Birlikte Satın Alınanlar', method: 'byProduct' },
    // Panel: "Ürün Detay 2 | Çok Satanlar" → Top Sellers (ürün bağlamı gerektirmez)
    { id: 2, title: 'Çok Satanlar', method: 'byId' },
  ],
  home: [
    // Panel: "Anasayfa 1 | Son Görüntülenenler" → Recently Viewed.
    // Dokümanda Recently Viewed yalnızca ürünlü metotta listeleniyor; ekranda ürün
    // bağlamı olmadığı için en son görüntülenen ürün gönderilir.
    { id: 3, title: 'Son Görüntülediklerin', method: 'byProduct' },
    // Panel: "Anasayfa 2 | Kullanıcıya Özel" → User-Based
    { id: 4, title: 'Sana Özel', method: 'byId' },
  ],
  cart: [
    // Panel: "Sepet 1 | Benzer Ürünler" → sepetteki ürünlerle ilişkili öneri
    { id: 5, title: 'Benzer Ürünler', method: 'byProductIds' },
    // Panel: "Sepet 2 | Popüler Ürünler" → Most Popular Items
    { id: 6, title: 'Popüler Ürünler', method: 'byId' },
  ],
  orderSuccess: [
    // Panel: "Sipariş Sonrası | Siparişinle Uyumlu" → Purchased with Last Purchased
    { id: 7, title: 'Siparişinle Uyumlu', method: 'byId' },
  ],
};

/** Slotun kampanyaları; kimliği geçersiz olan kayıtlar (ör. kampanya kapatıldı) elenir. */
export function getInsiderRecommendationCampaigns(
  slot: InsiderRecommendationSlot,
): InsiderRecommendationCampaign[] {
  return (INSIDER_RECOMMENDATION_CAMPAIGNS[slot] ?? []).filter(
    (campaign) => Number.isFinite(campaign.id) && campaign.id > 0,
  );
}
