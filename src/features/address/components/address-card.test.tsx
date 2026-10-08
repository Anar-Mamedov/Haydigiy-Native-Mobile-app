import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Address } from '@/types/address.types';
import { AddressCard } from './address-card';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

const ADDRESS: Address = {
  id: '7',
  title: 'Ev',
  name: 'Anar',
  surname: 'Mamedov',
  phone: '05551234567',
  addressLine: 'Cadde 1',
  city: 'İstanbul',
  district: 'Kadıköy',
  neighbourhood: 'Moda',
  isDefault: false,
};

describe('AddressCard', () => {
  it('marks the default address like the web list', () => {
    renderWithTamagui(
      <AddressCard address={{ ...ADDRESS, isDefault: true }} onDelete={jest.fn()} onEdit={jest.fn()} />,
    );

    expect(screen.getByText('Ev')).toBeTruthy();
    expect(screen.getByText('Varsayılan')).toBeTruthy();
  });

  it('shows no badge for other addresses', () => {
    renderWithTamagui(<AddressCard address={ADDRESS} onDelete={jest.fn()} onEdit={jest.fn()} />);
    expect(screen.queryByText('Varsayılan')).toBeNull();
  });

  it('keeps the badge readable in dark theme', () => {
    renderWithTamagui(
      <AddressCard address={{ ...ADDRESS, isDefault: true }} onDelete={jest.fn()} onEdit={jest.fn()} />,
      'dark',
    );

    expect(screen.getByText('Varsayılan')).toBeTruthy();
  });
});
