import { useQuery } from '@tanstack/react-query';
import { productKeys } from '@/features/product/api/product.keys';
import { mapProductDto } from '@/features/product/api/product.mapper';
import {
  getProductByIdDto,
  listFeaturedProductDtos,
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
