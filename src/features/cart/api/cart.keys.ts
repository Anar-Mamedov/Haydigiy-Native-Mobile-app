export const cartKeys = {
  all: ['cart'] as const,
  list: () => [...cartKeys.all, 'list'] as const,
  /**
   * Kampanya bandı listelenen kategoriye göre değişir (kategoriye özel hediye
   * kampanyası); kategorisiz liste `null` anahtarını paylaşır.
   */
  campaigns: (categoryId?: number) => [...cartKeys.all, 'campaigns', categoryId ?? null] as const,
};
