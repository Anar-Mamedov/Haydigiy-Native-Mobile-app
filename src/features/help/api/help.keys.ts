/** Query keys for the "Yardım & Sıkça Sorulan Sorular" feature. */
export const helpKeys = {
  all: ['help'] as const,
  categories: () => [...helpKeys.all, 'categories'] as const,
};
