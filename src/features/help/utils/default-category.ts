import { HelpCategory } from '@/types/help.types';

/**
 * Picks the help category to show first. A category requested by slug (web
 * `/yardim?kategori=iptal-iade`) wins when it exists; otherwise the first
 * category in the list. Returns null when there are no categories.
 */
export function getDefaultCategoryId(
  categories: HelpCategory[],
  preferredSlug?: string | null,
): number | null {
  if (categories.length === 0) return null;

  const preferred = preferredSlug?.trim().toLowerCase();
  const match = preferred
    ? categories.find((category) => category.slug?.toLowerCase() === preferred)
    : undefined;

  return (match ?? categories[0]).id;
}
