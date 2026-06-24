import { ProductReviewFilters } from '@/services/product.service';

/** Query keys for the dedicated product reviews page. */
export const productReviewKeys = {
  all: ['product-reviews'] as const,
  page: (slug: string, filters: ProductReviewFilters) =>
    [...productReviewKeys.all, slug, filters] as const,
};
