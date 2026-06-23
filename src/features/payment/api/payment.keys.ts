/** Query keys for the "Ödeme Bilgilerim" feature (saved refund IBANs). */
export const paymentKeys = {
  all: ['payment-methods'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
};
