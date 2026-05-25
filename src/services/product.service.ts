import { ProductDto, SearchProductDto, SearchProductsResponseDto } from '@/features/product/api/product.dtos';
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

export interface SearchProductsParams {
  c?: string | number;
  q?: string;
  page?: string | number;
  colors?: string;
  price_range?: string;
  min_price?: string;
  max_price?: string;
  sorting?: string;
  variants?: string;
  property_ids?: string;
  product_categories?: string;
}

export async function searchProductDtos(params: SearchProductsParams): Promise<SearchProductsResponseDto> {

  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    let list = [...mockProductDtos];
    if (params.q) {
      const query = String(params.q).toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(query) || p.description_text.toLowerCase().includes(query));
    }
    const searchData = list.map((p) => ({
      id: parseInt(p.id.replace(/\D/g, '')) || 999,
      name: p.title,
      slug: p.slug,
      price: p.price,
      max_price: p.original_price,
      average_rating: p.rating,
      reviews_count: p.review_count,
      image_urls: {
        medium: p.image_url,
        thumb: p.image_url,
        large: p.image_url,
      },
      brand_name: p.brand_name,
      category_names: [p.category_name],
      has_stock: true,
      shipping_label: p.shipping_label,
      badge: p.badge,
      seller_name: p.seller_name,
      description_text: p.description_text,
    }));

    return {
      data: searchData,
      total: searchData.length,
      current_page: 1,
      last_page: 1,
      per_page: 20,
    };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<SearchProductsResponseDto>('/search-products', {
    params: {
      c: params.c,
      q: params.q,
      page: params.page,
      colors: params.colors,
      price_range: params.price_range,
      min_price: params.min_price,
      max_price: params.max_price,
      sorting: params.sorting,
      variants: params.variants,
      property_ids: params.property_ids,
      product_categories: params.product_categories,
    },
  });

  const raw = response.data;
  let productsData: any[] = [];
  if (Array.isArray(raw.data)) {
    productsData = raw.data;
  } else if (raw.products && Array.isArray((raw.products as any).data)) {
    productsData = (raw.products as any).data;
  } else if (Array.isArray(raw.products)) {
    productsData = raw.products;
  }

  const currentPage = raw.current_page ?? (raw.products as any)?.current_page ?? 1;
  const lastPage = raw.last_page ?? (raw.products as any)?.last_page ?? 1;
  const total = raw.total ?? (raw.products as any)?.total ?? 0;
  const perPage = raw.per_page ?? (raw.products as any)?.per_page ?? 20;

  return {
    data: productsData,
    category: raw.category,
    available_filters: raw.available_filters,
    current_page: currentPage,
    last_page: lastPage,
    total,
    per_page: perPage,
  };
}
