export const orderMergeKeys = {
  all: ['order-merge'] as const,
  eligibility: () => [...orderMergeKeys.all, 'eligibility'] as const,
};
