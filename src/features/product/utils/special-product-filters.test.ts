import type { ProductAvailableFilters } from '@/types/product.types';
import { getSpecialProductFilters } from './special-product-filters';

function offer(flags: Partial<ProductAvailableFilters>): ProductAvailableFilters {
  return {
    colors: [],
    variants: [],
    properties: [],
    priceRanges: [],
    productCategories: [],
    categoryChildren: [],
    useProductCategoryFilters: false,
    hasCombinationProduct: false,
    hasOpportunityPackage: false,
    ...flags,
  };
}

describe('getSpecialProductFilters', () => {
  it('lists the filters the listing offers in web order', () => {
    expect(
      getSpecialProductFilters(offer({ hasCombinationProduct: true, hasOpportunityPackage: true }), {}),
    ).toEqual([
      { key: 'has_combination_product', label: 'Kombin Ürünleri', isActive: false },
      { key: 'has_opportunity_package', label: 'Fırsat Ürünleri', isActive: false },
    ]);
  });

  it('hides filters the listing does not offer', () => {
    expect(getSpecialProductFilters(offer({ hasOpportunityPackage: true }), {})).toEqual([
      { key: 'has_opportunity_package', label: 'Fırsat Ürünleri', isActive: false },
    ]);
    expect(getSpecialProductFilters(undefined, {})).toEqual([]);
  });

  it('keeps a selected filter even when the listing stops offering it', () => {
    expect(getSpecialProductFilters(offer({}), { has_combination_product: '1' })).toEqual([
      { key: 'has_combination_product', label: 'Kombin Ürünleri', isActive: true },
    ]);
  });
});
