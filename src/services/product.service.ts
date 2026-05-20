import { ProductDto } from '@/features/product/api/product.dtos';
import { mockProductDtos } from '@/features/product/data/mock-product-dtos';
import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';
import { sleep } from '@/utils/sleep';

export const productEndpoints = {
  detail: (productId: string) => `/products/${productId}`,
  featured: '/products/featured',
  list: '/products',
};

export async function listFeaturedProductDtos(): Promise<ProductDto[]> {
  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    return mockProductDtos;
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<ProductDto[]>(productEndpoints.featured);
  return response.data;
}

export async function getProductByIdDto(productId: string): Promise<ProductDto> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    const dto = mockProductDtos.find((product) => product.id === productId);

    if (!dto) {
      throw new Error(`Product with id "${productId}" was not found.`);
    }

    return dto;
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<ProductDto>(productEndpoints.detail(productId));
  return response.data;
}
