import { HelpCategory } from '@/types/help.types';

/**
 * Picks the help category to show first: the first category in the list.
 * Returns null when there are no categories.
 */
export function getDefaultCategoryId(categories: HelpCategory[]): number | null {
  return categories.length > 0 ? categories[0].id : null;
}
