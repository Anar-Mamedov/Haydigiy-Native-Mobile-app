export const blogKeys = {
  all: ['blog'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  /** Tüm yazılar için `null`, kategori sayfası için API'nin `category_slug` değeri. */
  list: (categorySlug: string | null) => [...blogKeys.lists(), { categorySlug }] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
};
