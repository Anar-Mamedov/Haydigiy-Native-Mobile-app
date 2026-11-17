import type { CategoryTreeNodeDto, CategoryTreeResponseDto } from '@/features/category/api/category-tree.dtos';
import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export const categoryTreeEndpoints = {
  tree: '/categories',
};

/** Bulunamayan bir sayfadan yönlendirme bekleyen kullanıcı genel istemci zaman aşımını (15 sn) beklemesin. */
const CATEGORY_TREE_TIMEOUT_MS = 5000;

/** Kategori ağacı (`GET /categories`); web'in kategori canonical adreslerini kurduğu kaynakla aynı. */
export async function fetchCategoryTreeDto(): Promise<CategoryTreeNodeDto[]> {
  // Mock katalogla çalışırken kategori ağacı yoktur.
  if (!appEnv.apiBaseUrl) {
    return [];
  }

  const response = await apiClient.get<CategoryTreeResponseDto>(categoryTreeEndpoints.tree, {
    timeout: CATEGORY_TREE_TIMEOUT_MS,
  });
  const body = response.data;
  if (Array.isArray(body)) return body;
  return Array.isArray(body?.data) ? body.data : [];
}
