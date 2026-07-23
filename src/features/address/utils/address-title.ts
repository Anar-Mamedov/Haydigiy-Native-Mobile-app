export const ADDRESS_TITLES = ['Ev', 'İş Yeri', 'Okul'] as const;

export type AddressTitle = (typeof ADDRESS_TITLES)[number];

export function isAddressTitle(value: unknown): value is AddressTitle {
  return typeof value === 'string' && ADDRESS_TITLES.some((title) => title === value);
}
