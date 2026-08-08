import type { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutDeliveryAddress } from './checkout-delivery-address';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutAddress } from '@/types/checkout.types';

// The shared `@/components/ui` barrel reaches expo-router through the app shell.
jest.mock('expo-router', () => ({
  usePathname: () => '/checkout',
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => false,
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

const address: CheckoutAddress = {
  id: 1,
  title: 'Ev',
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
  isDefault: true,
  isInvoice: true,
};

type CheckoutDeliveryAddressProps = ComponentProps<typeof CheckoutDeliveryAddress>;

function makeProps(
  overrides: Partial<CheckoutDeliveryAddressProps> = {},
): CheckoutDeliveryAddressProps {
  return {
    addresses: [address],
    billingAddress: address,
    isError: false,
    isLoading: false,
    onAddAddress: jest.fn(),
    onEditAddress: jest.fn(),
    onRetry: jest.fn(),
    onSelectBilling: jest.fn(),
    onSelectShipping: jest.fn(),
    onToggleInvoiceSame: jest.fn(),
    sendInvoiceToSameAddress: true,
    shippingAddress: address,
    ...overrides,
  };
}

describe('CheckoutDeliveryAddress', () => {
  it('toggles the same-invoice-address option when the checkout is not locked', () => {
    const onToggleInvoiceSame = jest.fn();
    renderWithTamagui(<CheckoutDeliveryAddress {...makeProps({ onToggleInvoiceSame })} />);

    fireEvent.press(screen.getByLabelText('Faturamı aynı adrese gönder'));

    expect(onToggleInvoiceSame).toHaveBeenCalledWith(false);
  });

  it('ignores the same-invoice-address toggle while the checkout is locked', () => {
    const onToggleInvoiceSame = jest.fn();
    renderWithTamagui(
      <CheckoutDeliveryAddress {...makeProps({ disabled: true, onToggleInvoiceSame })} />,
    );

    fireEvent.press(screen.getByLabelText('Faturamı aynı adrese gönder'));

    expect(onToggleInvoiceSame).not.toHaveBeenCalled();
  });

  it('marks the address change action as disabled while the checkout is locked', () => {
    renderWithTamagui(<CheckoutDeliveryAddress {...makeProps({ disabled: true })} />);

    expect(screen.getByLabelText('Adresi değiştir').props.accessibilityState.disabled).toBe(true);
  });
});
