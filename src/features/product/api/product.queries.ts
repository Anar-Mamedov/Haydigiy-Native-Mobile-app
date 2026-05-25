import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productKeys } from '@/features/product/api/product.keys';
import { mapAvailableFilters, mapProductDto, mapSearchProductDto } from '@/features/product/api/product.mapper';
import {
  getProductByIdDto,
  listFeaturedProductDtos,
  searchProductDtos,
  SearchProductsParams,
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
  });
}

