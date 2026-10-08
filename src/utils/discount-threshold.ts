/**
 * İndirim sayılmak için aşılması gereken en küçük yüzde. Web ile aynı kural: %3 ve altındaki
 * fark — ürün indirimi de paket kazancı da — indirim olarak gösterilmez; ne oran rozeti ne üstü
 * çizili fiyat ne de yeşil indirim düzeni çizilir, fiyat normal (turuncu) düzende kalır.
 *
 * Eşik yalnızca burada durur; ürün kartı, ürün detayı ve paket kutuları aynı kararı buradan alır.
 */
export const MIN_DISPLAYED_DISCOUNT_PERCENT = 3;

/** Yüzde, ekranda indirim olarak gösterilecek kadar büyük mü (sonlu ve eşiğin üstünde). */
export function isDisplayableDiscountPercent(percent: number | null | undefined): percent is number {
  return typeof percent === 'number' && Number.isFinite(percent) && percent > MIN_DISPLAYED_DISCOUNT_PERCENT;
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
