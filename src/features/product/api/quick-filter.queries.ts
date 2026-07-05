import { useQuery } from '@tanstack/react-query';
import { getQuickFiltersDto } from '@/services/quick-filter.service';
import { quickFilterKeys } from './quick-filter.keys';
import { mapQuickFilterResponseDto } from './quick-filter.mapper';

/**
 * Curated shortcut filter groups for a category. Disabled without a category
 * id (search results, deep links without `c`), matching the web where the
 * quick filter row only renders on category listings.
 */
export function useQuickFiltersQuery(categoryId: number | undefined) {
  const isEnabled = typeof categoryId === 'number' && Number.isFinite(categoryId);

  return useQuery({
    enabled: isEnabled,
    queryFn: async () => {
      const dto = await getQuickFiltersDto(categoryId as number);
      return mapQuickFilterResponseDto(dto);
    },
    queryKey: quickFilterKeys.byCategory(isEnabled ? (categoryId as number) : -1),
    // Shortcut groups are catalog configuration; they change far less often
    // than the product list, so avoid refetching them on every focus.
    staleTime: 5 * 60_000,
  });
}
