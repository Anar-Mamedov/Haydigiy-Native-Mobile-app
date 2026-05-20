export const productKeys = {
  all: ['products'] as const,
  detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
};
