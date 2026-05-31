import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { productKeys } from '@/features/product/api/product.keys';
import { mapAvailableFilters, mapProductDto, mapSearchProductDto, mapProductDetailDto } from '@/features/product/api/product.mapper';
import {
  getProductByIdDto,
  listFeaturedProductDtos,
  searchProductDtos,
  SearchProductsParams,
  getSearchSuggestions,
  getProductDetailBySlug,
  getCurrentSlugById,
  getProductReviews,
} from '@/services/product.service';

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
      return mapProductDetailDto(rawDetail);
    },
  });
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

