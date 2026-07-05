export const quickFilterKeys = {
  all: ['quick-filters'] as const,
  byCategory: (categoryId: number) => [...quickFilterKeys.all, categoryId] as const,
};
