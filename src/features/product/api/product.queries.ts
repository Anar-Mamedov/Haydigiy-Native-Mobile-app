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

export function useProductDetailsQuery(idOrSlug: string) {
  return useQuery({
    enabled: Boolean(idOrSlug),
    queryKey: productKeys.detail(idOrSlug),
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
      const product = mapProductDetailDto(rawDetail);
      return hydrateProductDetailReviews(slug, product);
    },
  });
}

async function hydrateProductDetailReviews(slug: string, product: Product): Promise<Product> {
  const hasReviews = product.reviewCount > 0 || (product.reviews?.length ?? 0) > 0;
  if (!hasReviews) return product;

  try {
    const reviewPage = await getProductReviewPageDto(slug);
    return mergeProductDetailReviewPage(product, reviewPage);
  } catch (error) {
    console.warn('Failed to hydrate product detail reviews:', error);
    return product;
  }
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
