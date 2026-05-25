import { apiClient } from '@/lib/axios';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { MenuItem, MenuGroup } from '../types/category.types';

export const categoryEndpoints = {
  menus: '/menus',
  items: (groupId: number) => `/menus/${groupId}/items`,
};

interface MenuGroupsResponse {
  menuGroups?: MenuGroup[];
}

export async function fetchMenuGroups(): Promise<MenuGroup[]> {
  getRequiredApiBaseUrl();
  const response = await apiClient.get<MenuGroupsResponse>(categoryEndpoints.menus);
  return response.data.menuGroups || [];
}

export async function fetchMenuItems(groupId: number): Promise<MenuItem[]> {
  getRequiredApiBaseUrl();
  const response = await apiClient.get<MenuItem[]>(categoryEndpoints.items(groupId));
  return response.data || [];
}

export async function fetchCategoryFirstProductImage(categoryId: number): Promise<{ image: string | null; productSlug?: string }> {
  getRequiredApiBaseUrl();
  try {
    const response = await apiClient.get<any>(categoryEndpoints.menus, {
      params: {
        c: categoryId,
        page: 1,
        per_page: 1,
      },
    });

    const products = response.data?.data || response.data?.products?.data || response.data?.products || [];
    if (products.length > 0 && products[0]) {
      const product = products[0];
      const imageUrl =
        product.image_urls?.medium ||
        product.image_urls?.thumb ||
        product.image_urls?.large ||
        product.media?.medium ||
        product.media?.thumb ||
        product.media?.large ||
        null;

      return {
        image: imageUrl,
        productSlug: product.slug || undefined,
      };
    }
  } catch (err) {
    console.error(`Error fetching first product image for category ${categoryId}:`, err);
  }
  return { image: null };
}
