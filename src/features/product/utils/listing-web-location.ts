import type { WebLocation } from '@/types/seo-redirect.types';

type ListingIdentity = {
  slug: string;
  categoryId?: number;
  menuUrl?: string;
  searchQuery?: string;
};

/**
 * Ürün listesinin web adresi: `/kolye-kupe-bileklik?c=216`, `/s/123`,
 * `/cok-satanlar?menu_url=cok-satanlar`. Uygulama rotası `/kategori/{slug}`
 * iken web'de liste kök seviyededir (bkz. `resolveDeepLinkPath`).
 *
 * Yalnızca listenin kimliği taşınır; sıralama/filtre seçimleri gönderilmez.
 * Kural listeye tanımlanır (resolve servisi `c=216&sorting=4` için de aynı
 * hedefi döndürür).
 */
export function buildListingWebLocation({
  slug,
  categoryId,
  menuUrl,
  searchQuery,
}: ListingIdentity): WebLocation {
  const query = [
    categoryId !== undefined ? `c=${categoryId}` : null,
    menuUrl ? `menu_url=${encodeURIComponent(menuUrl)}` : null,
    searchQuery ? `q=${encodeURIComponent(searchQuery)}` : null,
  ].filter((pair): pair is string => pair !== null);

  return { path: `/${slug}`, queryString: query.join('&') };
}
