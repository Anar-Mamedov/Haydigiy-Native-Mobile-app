/**
 * Web listeleme URL'lerinin sorgu parametreleri ile ürün listesi ekranının
 * alanları arasındaki eşleme.
 *
 * Derin bağlantıyla gelen bir liste (`/haydigiy-butik?c=147&sorting=4`,
 * `/search?q=...&colors=siyah`) uygulamada da aynı sıralama ve filtrelerle
 * açılmalı. Eşleme rota dosyasında değil burada durur: saf bir dönüşüm olduğu
 * için ayrıca test edilebilir ve ekran ham sorgu biçimini hiç görmez.
 *
 * Web URL'inde ürün kategorisi filtresi `pc` kısaltmasıyla taşınır; API ve ekran
 * `product_categories` bekler, çeviri burada yapılır.
 */

/** Ekranın durumunu başlatan sıralama/filtre seçimleri. */
export type ProductListingFilters = {
  colors?: string;
  maxPrice?: string;
  minPrice?: string;
  priceRange?: string;
  productCategories?: string;
  propertyIds?: string;
  sorting?: string;
  variants?: string;
};

/** Hangi listenin, hangi filtrelerle açılacağı. */
export type ProductListingTarget = {
  categoryId?: number;
  filters: ProductListingFilters;
  searchQuery?: string;
};

type RawParams = Record<string, string | string[] | undefined>;

/** Expo Router aynı anahtarı birden çok kez görürse dizi verir; ilki yeterlidir. */
function readParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Kategori kimliği yalnızca pozitif tam sayıysa kabul edilir. */
function readCategoryId(value: string | string[] | undefined): number | undefined {
  const raw = readParam(value);
  if (!raw || !/^[1-9]\d*$/.test(raw)) return undefined;

  const parsed = Number.parseInt(raw, 10);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parseProductListingTarget(params: RawParams): ProductListingTarget {
  return {
    categoryId: readCategoryId(params.c),
    searchQuery: readParam(params.q),
    filters: {
      colors: readParam(params.colors),
      maxPrice: readParam(params.max_price),
      minPrice: readParam(params.min_price),
      priceRange: readParam(params.price_range),
      productCategories: readParam(params.pc) ?? readParam(params.product_categories),
      propertyIds: readParam(params.property_ids),
      sorting: readParam(params.sorting),
      variants: readParam(params.variants),
    },
  };
}

/**
 * Ekranı yeniden kuran anahtar. `kategori/[slug]` rotası bağlıyken başka bir
 * kategoriye ya da aramaya geçilebiliyor; sıralama/filtre de anahtara girmezse
 * yeni bir derin bağlantı geldiğinde ekran eski filtre durumunu korur ve
 * bağlantıdaki seçimler uygulanmaz.
 */
export function buildProductListingKey(
  slug: string | undefined,
  target: ProductListingTarget,
): string {
  return [
    slug ?? '',
    target.categoryId ?? '',
    target.searchQuery ?? '',
    target.filters.sorting ?? '',
    target.filters.colors ?? '',
    target.filters.variants ?? '',
    target.filters.priceRange ?? '',
    target.filters.minPrice ?? '',
    target.filters.maxPrice ?? '',
    target.filters.propertyIds ?? '',
    target.filters.productCategories ?? '',
  ].join('|');
}
