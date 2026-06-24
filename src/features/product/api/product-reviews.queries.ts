import { useQuery } from '@tanstack/react-query';
import { productReviewKeys } from './product-reviews.keys';
import { mapProductReviewPage, ProductReviewPage } from './product-reviews.mapper';
import { getProductReviewPageDto, ProductReviewFilters } from '@/services/product.service';

/** Loads the dedicated product reviews page (`GET /product/{slug}/review`). */
export function useProductReviewsQuery(slug: string, filters: ProductReviewFilters = {}) {
  return useQuery<ProductReviewPage>({
    queryKey: productReviewKeys.page(slug, filters),
    enabled: Boolean(slug),
    queryFn: async () => {
      const dto = await getProductReviewPageDto(slug, filters);
      return mapProductReviewPage(dto);
    },
  });
}
