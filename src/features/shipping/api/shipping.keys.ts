export const shippingKeys = {
  all: ['shipping'] as const,
  estimate: () => [...shippingKeys.all, 'estimate'] as const,
};
