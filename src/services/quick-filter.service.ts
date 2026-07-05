import { QuickFilterResponseDto } from '@/features/product/api/quick-filter.dtos';
import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';

export const quickFilterEndpoints = {
  byCategory: (categoryId: number) => `/quick-filter/${categoryId}`,
};

export async function getQuickFiltersDto(categoryId: number): Promise<QuickFilterResponseDto> {
  // Quick filters only exist on the live backend; mock catalog data has no
  // curated shortcut groups, so offline development simply hides the row.
  if (!appEnv.apiBaseUrl) {
    return { status: 'success', data: [] };
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<QuickFilterResponseDto>(
    quickFilterEndpoints.byCategory(categoryId),
  );
  return response.data;
}
