import { act, renderHook } from '@testing-library/react-native';
import { countActiveListingFilters, useProductListingFilters } from './use-product-listing-filters';

describe('countActiveListingFilters', () => {
  it('counts every selected value, a price range and each special filter once', () => {
    expect(
      countActiveListingFilters({
        colors: '1,2',
        variants: '10',
        property_ids: '21,22,23',
        product_categories: '100',
        price_range: '1',
        min_price: '0',
        max_price: '100',
        has_combination_product: '1',
        has_opportunity_package: '1',
      }),
    ).toBe(10);
    expect(countActiveListingFilters({})).toBe(0);
  });
});

describe('useProductListingFilters', () => {
  it('starts from the deep link selections', () => {
    const { result } = renderHook(() =>
      useProductListingFilters({ colors: 'siyah', sorting: '4', hasCombinationProduct: true }),
    );

    expect(result.current.sorting).toBe('4');
    expect(result.current.values).toEqual(
      expect.objectContaining({ colors: 'siyah', has_combination_product: '1', has_opportunity_package: undefined }),
    );
    expect(result.current.activeFiltersCount).toBe(2);
  });

  it('merges partial updates and replaces on a full apply', () => {
    const { result } = renderHook(() => useProductListingFilters({ colors: 'siyah' }));

    act(() => result.current.applyPartialFilters({ variants: '38' }));
    expect(result.current.values).toEqual(expect.objectContaining({ colors: 'siyah', variants: '38' }));

    act(() => result.current.applyFilters({ property_ids: '5' }));
    expect(result.current.values).toEqual({ property_ids: '5' });
  });

  it('toggles a special filter and clears everything on reset', () => {
    const { result } = renderHook(() => useProductListingFilters());

    act(() => result.current.toggleSpecialFilter('has_opportunity_package'));
    expect(result.current.values.has_opportunity_package).toBe('1');

    act(() => result.current.toggleSpecialFilter('has_opportunity_package'));
    expect(result.current.values.has_opportunity_package).toBeUndefined();

    act(() => result.current.setVariants('38'));
    act(() => result.current.resetFilters());
    expect(result.current.values).toEqual({});
    expect(result.current.activeFiltersCount).toBe(0);
  });
});
