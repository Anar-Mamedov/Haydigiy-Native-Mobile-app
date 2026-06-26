import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { CheckoutAddressListContent } from './checkout-address-picker';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutAddress } from '@/types/checkout.types';

const addresses: CheckoutAddress[] = [
  {
    id: 1,
    title: 'Bursa',
    name: 'Anar',
    surname: 'Mamedov',
    email: null,
    phone: '5076534641',
    addressLine: 'Taşova Caddesi, No. 4, Daire 11',
    zipCode: '',
    cityId: 16,
    cityName: 'BURSA',
    districtId: 1,
    districtName: 'NİLÜFER',
    neighbourhoodId: 10,
    neighbourhoodName: 'GÖRÜKLE MAH.',
    isDefault: false,
    isInvoice: false,
  },
  {
    id: 2,
    title: 'ev',
    name: 'Anar',
    surname: 'Mamedov',
    email: null,
    phone: '5076534641',
    addressLine: 'haydigiy ofisi',
    zipCode: '',
    cityId: 51,
    cityName: 'NİĞDE',
    districtId: 2,
    districtName: 'MERKEZ',
    neighbourhoodId: 11,
    neighbourhoodName: 'MERKEZ MAH. (ÇAVDARLI KÖYÜ)',
    isDefault: true,
    isInvoice: true,
  },
];

function renderPicker(overrides: Partial<ComponentProps<typeof CheckoutAddressListContent>> = {}) {
  const props: ComponentProps<typeof CheckoutAddressListContent> = {
    addresses,
    badgeMode: 'default',
    onEditAddress: jest.fn(),
    onSelect: jest.fn(),
    selectedId: 2,
    ...overrides,
  };

  renderWithTamagui(<CheckoutAddressListContent {...props} />);
  return props;
}

describe('CheckoutAddressListContent', () => {
  it('renders the selected default address like the checkout sheet', () => {
    renderPicker();

    expect(screen.getByText('Bursa')).toBeTruthy();
    expect(screen.getByText('ev')).toBeTruthy();
    expect(screen.getByText('Varsayılan')).toBeTruthy();
    expect(
      screen.getByText('MERKEZ MAH. (ÇAVDARLI KÖYÜ), haydigiy ofisi, MERKEZ, NİĞDE'),
    ).toBeTruthy();
    expect(screen.getByLabelText('ev adresini seç').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it('selects and edits an address from the sheet list', () => {
    const onSelect = jest.fn();
    const onEditAddress = jest.fn();
    renderPicker({ onEditAddress, onSelect });

    fireEvent.press(screen.getByLabelText('Bursa adresini seç'));
    expect(onSelect).toHaveBeenCalledWith(addresses[0]);

    fireEvent.press(screen.getByLabelText('Bursa adresini düzenle'));
    expect(onEditAddress).toHaveBeenCalledWith(addresses[0]);
  });

  it('keeps invoice badges visible in dark theme', () => {
    renderWithTamagui(
      <CheckoutAddressListContent
        addresses={addresses}
        badgeMode="invoice"
        onEditAddress={jest.fn()}
        onSelect={jest.fn()}
        selectedId={2}
      />,
      'dark',
    );

    expect(screen.getByText('Fatura Adresi')).toBeTruthy();
  });
});
