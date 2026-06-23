import { useQuery } from '@tanstack/react-query';
import { helpKeys } from './help.keys';
import { mapHelpCategory } from './help.mapper';
import { getHelpCategoriesDto } from '@/services/help.service';
import { HelpCategory } from '@/types/help.types';

/** Loads the help/FAQ categories (`GET /help`). */
export function useHelpQuery(enabled = true) {
  return useQuery<HelpCategory[]>({
    queryKey: helpKeys.categories(),
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const dtos = await getHelpCategoriesDto();
      return dtos.map(mapHelpCategory);
    },
  });
}
