import { useMemo } from 'react';
import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { productKeys } from '@/features/product/api/product.keys';
import {
  mapAvailableFilters,
  mapPopularProductDto,
  mapProductDetailDto,
  mapProductDto,
  mapSearchProductDto,
  mergeProductDetailReviewPage,
} from '@/features/product/api/product.mapper';
import {
  getProductByIdDto,
  listFeaturedProductDtos,
  searchProductDtos,
  SearchProductsParams,
  getSearchSuggestions,
  getProductDetailBySlug,
  getCurrentSlugById,
  getProductReviews,
  getProductReviewPageDto,
} from '@/services/product.service';
import { listPopularProductDtos } from '@/services/popular-products.service';
import { Product } from '@/types/product.types';

export function useFeaturedProductsQuery() {
  return useQuery({
    queryFn: async () => {
      const dtos = await listFeaturedProductDtos();
      return dtos.map(mapProductDto);
    },
    queryKey: productKeys.featured(),
  });
}

export function useProductByIdQuery(productId: string) {
  return useQuery({
    enabled: Boolean(productId),
    queryFn: async () => {
      const dto = await getProductByIdDto(productId);
      return mapProductDto(dto);
    },
    queryKey: productKeys.detail(productId),
  });
}

export function useInfiniteSearchProductsQuery(filters: Omit<SearchProductsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchProductDtos({
        ...filters,
        page: pageParam,
      });

      return {
        products: (response.data || []).map(mapSearchProductDto),
        category: response.category,
        availableFilters: mapAvailableFilters(response.available_filters),
        pagination: {
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          total: response.total || 0,
          per_page: response.per_page || 20,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    // Keep the previous results and filter options on screen while a new filter
    // selection is being fetched, so toggling filters doesn't blank the list.
    placeholderData: keepPreviousData,
  });
}

export function useSearchSuggestionsQuery(query: string) {
  const trimmedQuery = query.trim();
  return useQuery({
    enabled: trimmedQuery.length >= 3,
    queryFn: () => getSearchSuggestions(trimmedQuery),
    queryKey: productKeys.suggestions(trimmedQuery),
  });
}

export function usePopularProductsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const dtos = await listPopularProductDtos();
      return dtos.map(mapPopularProductDto);
    },
    queryKey: productKeys.popular(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Browsing back and forth between the list and the same product within this
 * window reuses the cached detail instead of re-running the request chain;
 * after it, a background refetch still refreshes price/stock without blanking
 * the screen.
 */
const PRODUCT_DETAIL_STALE_TIME = 60 * 1000;

/**
 * Product detail for the PDP. The base detail request resolves on its own so
 * variants, colors and sizes render as soon as it lands; the review page is
 * fetched by a separate dependent query and merged in when available.
 * (Previously the review request was awaited inside the detail queryFn, which
 * delayed the entire detail — including the variant selectors — by a full
 * round-trip even though reviews render far below the fold.)
 */
export function useProductDetailsQuery(idOrSlug: string) {
  const detailQuery = useQuery({
    enabled: Boolean(idOrSlug),
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

  const detail = detailQuery.data;
  const reviewSlug = detail?.slug ?? '';
  const hasReviews = Boolean(detail && (detail.reviewCount > 0 || (detail.reviews?.length ?? 0) > 0));

  // Failure here degrades gracefully: the detail payload's own review summary
  // stays on screen and the query retries per the client defaults.
  const reviewPageQuery = useQuery({
    enabled: Boolean(reviewSlug) && hasReviews,
    queryKey: productKeys.detailReviews(reviewSlug),
    staleTime: PRODUCT_DETAIL_STALE_TIME,
    queryFn: () => getProductReviewPageDto(reviewSlug),
  });

  const data = useMemo<Product | undefined>(() => {
    if (!detail || !reviewPageQuery.data) return detail;
    return mergeProductDetailReviewPage(detail, reviewPageQuery.data);
  }, [detail, reviewPageQuery.data]);

  return {
    data,
    isError: detailQuery.isError,
    isPending: detailQuery.isPending,
    refetch: detailQuery.refetch,
  };
}

export function useProductReviewsQuery(slug: string) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: [...productKeys.all, 'reviews', slug] as const,
    queryFn: async () => {
      const response = await getProductReviews(slug);
      return response?.reviews?.data || [];
    },
  });
}
