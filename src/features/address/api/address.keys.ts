/** Query keys for the "Adres Bilgilerim" feature (list, detail, location lookups). */
export const addressKeys = {
  all: ['address'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  detail: (id: string) => [...addressKeys.all, 'detail', id] as const,
  cities: () => [...addressKeys.all, 'cities'] as const,
  districts: (cityId: string) => [...addressKeys.all, 'districts', cityId] as const,
  neighbourhoods: (districtId: string) =>
    [...addressKeys.all, 'neighbourhoods', districtId] as const,
};
