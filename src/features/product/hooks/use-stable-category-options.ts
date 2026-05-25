import { useEffect, useMemo, useState } from 'react';
import { ProductAvailableFilters } from '@/types/product.types';

type CategoryOptions = Pick<ProductAvailableFilters, 'productCategories' | 'categoryChildren'>;

/**
 * The backend narrows `productCategories` to whatever co-occurs with the active
 * selection, which would make the other options vanish once one is picked. Keep the
 * options captured while no category filter was applied so multi-select stays usable.
 */
export function useStableCategoryOptions(
  availableFilters: ProductAvailableFilters | undefined,
  hasCategoryFilter: boolean,
): ProductAvailableFilters | undefined {
  const [baseOptions, setBaseOptions] = useState<CategoryOptions | null>(null);

  useEffect(() => {
    if (hasCategoryFilter || !availableFilters) return;
    const { productCategories, categoryChildren } = availableFilters;
    if (productCategories.length > 0 || categoryChildren.length > 0) {
      setBaseOptions({ productCategories, categoryChildren });
    }
  }, [availableFilters, hasCategoryFilter]);

  return useMemo(() => {
    if (!availableFilters || !hasCategoryFilter || !baseOptions) return availableFilters;
    return {
      ...availableFilters,
      productCategories: baseOptions.productCategories,
      categoryChildren: baseOptions.categoryChildren,
    };
  }, [availableFilters, hasCategoryFilter, baseOptions]);
}
