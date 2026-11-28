/**
 * İndirim sayılmak için aşılması gereken en küçük yüzde, yüzeye göre. Web ile aynı kural:
 * - Liste/ızgara kartı ve paket kazancı: %3 ve altındaki fark indirim olarak gösterilmez; ne oran
 *   rozeti ne üstü çizili fiyat ne de yeşil indirim düzeni çizilir, fiyat normal düzende kalır.
 * - Ürün detayı (alt bar, beden seçim sayfası): her pozitif indirim gösterilir (web `fd30ed0a6`,
 *   `discount_rate > 0`; webde liste kartları ve paket kazancı `> 3`te kaldı).
 *
 * Eşikler yalnızca burada durur; ürün kartı, ürün detayı ve paket kutuları kararı buradan alır.
 */
export const DISCOUNT_DISPLAY_THRESHOLDS = {
  bundle: 3,
  card: 3,
  detail: 0,
} as const;

/** İndirimin çizildiği yüzey; her yüzeyin eşiği `DISCOUNT_DISPLAY_THRESHOLDS`'tadır. */
export type DiscountDisplaySurface = keyof typeof DISCOUNT_DISPLAY_THRESHOLDS;

/** Yüzde, verilen yüzeyde indirim olarak gösterilecek kadar büyük mü (sonlu ve eşiğin üstünde). */
export function isDisplayableDiscountPercent(
  percent: number | null | undefined,
  surface: DiscountDisplaySurface = 'card',
): percent is number {
  return (
    typeof percent === 'number' &&
    Number.isFinite(percent) &&
    percent > DISCOUNT_DISPLAY_THRESHOLDS[surface]
  );
}

/**
 * Eski fiyattan güncel fiyata düşüşü tam sayı yüzdeye çevirir (ör. 500 → 400 = 20). Oran
 * backend'den gelmediğinde eşiğin aynı yuvarlamayla uygulanabilmesi içindir; eski fiyat
 * pozitif değilse ya da güncel fiyattan yüksek değilse 0'dır.
 */
export function getDiscountPercent(previousPrice: number, currentPrice: number): number {
  if (!Number.isFinite(previousPrice) || !Number.isFinite(currentPrice)) return 0;
  if (previousPrice <= 0 || previousPrice <= currentPrice) return 0;

  return Math.round(((previousPrice - currentPrice) / previousPrice) * 100);
}
