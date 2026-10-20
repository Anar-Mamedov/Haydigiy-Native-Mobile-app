import type { ProductAvailableFilters } from '@/types/product.types';

/** API'ye `1` olarak giden özel ürün filtreleri (web `Filters` "Ürün Tipi"). */
export type SpecialProductFilterKey = 'has_combination_product' | 'has_opportunity_package';

export type SpecialProductFilter = {
  key: SpecialProductFilterKey;
  label: string;
  isActive: boolean;
};

type SpecialFilterDefinition = {
  key: SpecialProductFilterKey;
  label: string;
  isOffered: (availableFilters: ProductAvailableFilters) => boolean;
};

/** Web sırası: önce Kombin, sonra Fırsat. */
const SPECIAL_PRODUCT_FILTERS: readonly SpecialFilterDefinition[] = [
  {
    key: 'has_combination_product',
    label: 'Kombin Ürünleri',
    isOffered: (availableFilters) => availableFilters.hasCombinationProduct,
  },
  {
    key: 'has_opportunity_package',
    label: 'Fırsat Ürünleri',
    isOffered: (availableFilters) => availableFilters.hasOpportunityPackage,
  },
];

export type SpecialFilterValues = Partial<Record<SpecialProductFilterKey, '1'>>;

/**
 * Listede gösterilecek özel filtreler: API'nin bu liste için sunduğu ya da
 * zaten seçili olanlar. Seçiliyken yanıt bayrağı düşse bile kullanıcı filtreyi
 * kaldırabilsin diye seçili olan her zaman listelenir.
 */
export function getSpecialProductFilters(
  availableFilters: ProductAvailableFilters | undefined,
  values: SpecialFilterValues,
): SpecialProductFilter[] {
  return SPECIAL_PRODUCT_FILTERS.filter(
    (filter) => values[filter.key] === '1' || (availableFilters ? filter.isOffered(availableFilters) : false),
  ).map(({ key, label }) => ({ key, label, isActive: values[key] === '1' }));
}
