export const productKeys = {
  all: ['products'] as const,
  /** Popülerlik listesinden açılan detay ayrı önbelleklenir; sıralama rozeti o listeye göredir. */
  detail: (productId: string, best?: string) =>
    best
      ? ([...productKeys.all, 'detail', productId, best] as const)
      : ([...productKeys.all, 'detail', productId] as const),
  detailReviews: (slug: string) => [...productKeys.all, 'detail-reviews', slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  list: (filters: Record<string, any>) => [...productKeys.all, 'list', filters] as const,
  popular: () => [...productKeys.all, 'popular'] as const,
  suggestions: (query: string) => [...productKeys.all, 'suggestions', query] as const,
};
