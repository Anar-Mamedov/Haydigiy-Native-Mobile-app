/** Query keys for the return-creation flow (reasons, IBANs, address lookups). */
export const returnKeys = {
  all: ['return'] as const,
  reasons: () => [...returnKeys.all, 'reasons'] as const,
  paymentMethods: () => [...returnKeys.all, 'payment-methods'] as const,
  cities: () => [...returnKeys.all, 'cities'] as const,
  districts: (cityId: string) => [...returnKeys.all, 'districts', cityId] as const,
  neighbourhoods: (districtId: string) =>
    [...returnKeys.all, 'neighbourhoods', districtId] as const,
  addresses: () => [...returnKeys.all, 'addresses'] as const,
};
