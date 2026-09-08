export const cartKeys = {
  all: ['cart'] as const,
  list: () => [...cartKeys.all, 'list'] as const,
  campaigns: () => [...cartKeys.all, 'campaigns'] as const,
};
