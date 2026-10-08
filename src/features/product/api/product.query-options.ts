import { queryOptions } from '@tanstack/react-query';
import { productKeys } from './product.keys';
import { mapProductDetailDto } from './product.mapper';
import { getCurrentSlugById, getProductDetailBySlug } from '@/services/product.service';

/**
 * Browsing back and forth between the list and the same product within this
 * window reuses the cached detail instead of re-running the request chain;
 * after it, a background refetch still refreshes price/stock without blanking
 * the screen.
 */
export const PRODUCT_DETAIL_STALE_TIME = 60 * 1000;

/**
 * Canonical base product-detail query (variants, colors, sizes). The PDP and the
 * home showcase quick add share it, so a size sheet opened from the home page
 * warms the cache for the detail screen and vice versa.
 */
export function productDetailQueryOptions(idOrSlug: string) {
  return queryOptions({
    queryKey: productKeys.detail(idOrSlug),
    staleTime: PRODUCT_DETAIL_STALE_TIME,
    queryFn: async () => {
      let slug = idOrSlug;
      const isNumeric = /^\d+$/.test(idOrSlug);

      if (isNumeric) {
        try {
          const res = await getCurrentSlugById(idOrSlug);
          if (res?.success && res.slug) {
            slug = res.slug;
          }
        } catch (error) {
          console.warn('Failed to resolve slug by id, falling back to direct slug fetch:', error);
        }
      }

      const rawDetail = await getProductDetailBySlug(slug);
      return mapProductDetailDto(rawDetail);
    },
  });
}
