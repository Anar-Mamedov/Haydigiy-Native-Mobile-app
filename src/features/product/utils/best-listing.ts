/**
 * Kategorinin popülerlik listeleri (web `bestListing`): `best=sales|views|favorites`.
 * Değer API'ye (`/search-products`, `/product/{slug}`) olduğu gibi gider; ürün
 * detayındaki sıralama rozeti ("En Çok Satan 1. Ürün") bu listeye bağlanır.
 */

export const BEST_LISTING_OPTIONS = [
  { value: 'sales', label: 'En Çok Satılanlar' },
  { value: 'views', label: 'En Çok Ziyaret Edilenler' },
  { value: 'favorites', label: 'En Çok Favorilenenler' },
] as const;

export type BestListingValue = (typeof BEST_LISTING_OPTIONS)[number]['value'];

/** Yalnızca API'nin desteklediği değerler kabul edilir; diğerleri yok sayılır. */
export function parseBestListingValue(value: string | string[] | null | undefined): BestListingValue | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return BEST_LISTING_OPTIONS.find((option) => option.value === raw)?.value;
}

/**
 * Başka bir popülerlik listesine geçiş. Web gibi yalnızca kategori (`c`) ve
 * `best` taşınır; önceki listenin sıralama/filtre seçimleri sıfırlanır.
 */
export function buildBestListingRoute(
  slug: string,
  categoryId: number | string | null | undefined,
  best: BestListingValue,
): string {
  const query = [categoryId != null && String(categoryId) ? `c=${encodeURIComponent(String(categoryId))}` : null, `best=${best}`]
    .filter((pair): pair is string => pair !== null)
    .join('&');
  return `/kategori/${slug}?${query}`;
}
