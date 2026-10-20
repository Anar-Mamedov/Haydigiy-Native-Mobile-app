import { useState } from 'react';
import type { ProductListingFilters } from '../utils/listing-deep-link-params';
import type { SpecialFilterValues, SpecialProductFilterKey } from '../utils/special-product-filters';

/**
 * Liste ekranındaki filtre seçimleri, API alan adlarıyla. Filtre sheet'i, hızlı
 * filtre dropdown'ı ve filtre çubuğu aynı nesneyi okur ve günceller.
 */
export type ListingFilterValues = SpecialFilterValues & {
  colors?: string;
  variants?: string;
  price_range?: string;
  min_price?: string;
  max_price?: string;
  property_ids?: string;
  product_categories?: string;
};

function countIds(value: string | undefined): number {
  return value ? value.split(',').length : 0;
}

/** "Filtrele" çipinin rozeti: seçili değer sayısı (fiyat aralığı ve özel filtreler birer sayılır). */
export function countActiveListingFilters(values: ListingFilterValues): number {
  return (
    countIds(values.colors) +
    countIds(values.variants) +
    countIds(values.property_ids) +
    countIds(values.product_categories) +
    (values.price_range ? 1 : 0) +
    (values.has_combination_product ? 1 : 0) +
    (values.has_opportunity_package ? 1 : 0)
  );
}

/** Derin bağlantıdaki seçimler ekranın ilk durumudur; sonrası kullanıcının seçimleridir. */
function toInitialValues(initialFilters: ProductListingFilters | undefined): ListingFilterValues {
  return {
    colors: initialFilters?.colors,
    variants: initialFilters?.variants,
    price_range: initialFilters?.priceRange,
    min_price: initialFilters?.minPrice,
    max_price: initialFilters?.maxPrice,
    property_ids: initialFilters?.propertyIds,
    product_categories: initialFilters?.productCategories,
    has_combination_product: initialFilters?.hasCombinationProduct ? '1' : undefined,
    has_opportunity_package: initialFilters?.hasOpportunityPackage ? '1' : undefined,
  };
}

/** Ürün listesinin sıralama ve filtre durumu; ekran yalnızca sunuma odaklansın diye ayrıdır. */
export function useProductListingFilters(initialFilters?: ProductListingFilters) {
  const [sorting, setSorting] = useState(initialFilters?.sorting ?? '');
  const [values, setValues] = useState<ListingFilterValues>(() => toInitialValues(initialFilters));

  /** Sheet tüm seçimleri birlikte gönderir; verilmeyen alan temizlenir. */
  const applyFilters = (next: ListingFilterValues) => setValues({ ...next });
  /** Dropdown yalnızca değişen alanları gönderir; diğerleri korunur. */
  const applyPartialFilters = (partial: ListingFilterValues) =>
    setValues((current) => ({ ...current, ...partial }));
  const resetFilters = () => setValues({});
  const setVariants = (variants: string | undefined) => setValues((current) => ({ ...current, variants }));
  const toggleSpecialFilter = (key: SpecialProductFilterKey) =>
    setValues((current) => ({ ...current, [key]: current[key] === '1' ? undefined : '1' }));

  return {
    sorting,
    setSorting,
    values,
    activeFiltersCount: countActiveListingFilters(values),
    applyFilters,
    applyPartialFilters,
    resetFilters,
    setVariants,
    toggleSpecialFilter,
  };
}
