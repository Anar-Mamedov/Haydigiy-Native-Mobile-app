import { mockProductDtos } from '@/features/product/data/mock-product-dtos';
import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';
import { sleep } from '@/utils/sleep';
import { FavoritesResponseDto } from '@/features/favorite/api/favorite.dtos';

export async function getFavoritesDto(query?: string): Promise<FavoritesResponseDto> {
  if (!appEnv.apiBaseUrl) {
    await sleep(150);
    const slice = mockProductDtos.slice(0, 3);
    const favorites = slice.map((p, index) => {
      const productId = parseInt(p.id.replace(/\D/g, '')) || (index + 1);
      return {
        product_id: productId,
        total_favorites: 120 + index,
        product: {
          id: productId,
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
          categories: [p.category_name, '100 TL'],
          main_category: p.category_name,
          is_approved_for_sale: 1,
          variants: [
            { id: 101, name: 'S', variant_id: 101, quantity: 5, price: String(p.price - 10) },
            { id: 102, name: 'M', variant_id: 102, quantity: 10, price: String(p.price) },
            { id: 103, name: 'L', variant_id: 103, quantity: 0, price: String(p.price) },
          ],
        },
      };
    });
    return { favorites };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<FavoritesResponseDto>('favorites/list', {
    params: query ? { q: query } : undefined,
  });
  return response.data;
}

export async function addFavoriteDto(productId: number): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    return { success: true };
  }
  getRequiredApiBaseUrl();
  const response = await apiClient.post('favorites/add', { product_id: productId });
  return response.data;
}

export async function removeFavoriteDto(productId: number): Promise<any> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    return { success: true };
  }
  getRequiredApiBaseUrl();
  const response = await apiClient.delete('favorites/remove', {
    data: { product_id: productId },
  });
  return response.data;
}
