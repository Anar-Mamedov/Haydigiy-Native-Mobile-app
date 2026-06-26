/** Query keys for the checkout/payment screen (payment types, cargo, coupons, installments). */
export const checkoutKeys = {
  all: ['checkout'] as const,
  paymentTypes: () => [...checkoutKeys.all, 'payment-types'] as const,
  cargo: (cityId?: number, districtId?: number, neighbourhoodId?: number) =>
    [...checkoutKeys.all, 'cargo', cityId ?? null, districtId ?? null, neighbourhoodId ?? null] as const,
  coupons: () => [...checkoutKeys.all, 'coupons'] as const,
  installments: (bin: string, amount: number) =>
    [...checkoutKeys.all, 'installments', bin, amount] as const,
};
