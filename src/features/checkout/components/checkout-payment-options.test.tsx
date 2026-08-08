import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { PaymentMethod } from '@/types/checkout.types';
import { CheckoutPaymentOptions } from './checkout-payment-options';

const methods: PaymentMethod[] = [
  {
    id: 1,
    name: 'Kredi / Banka Kartı',
    slug: 'credit_card',
    commissionRate: 0,
    serviceFee: 0,
    sortOrder: 1,
    description: 'Peşin fiyatına 3 taksit',
    maxOrderTotal: null,
  },
  {
    id: 2,
    name: 'Kapıda Nakit Ödeme',
    slug: 'cash_on_delivery',
    commissionRate: 0,
    serviceFee: 19.99,
    sortOrder: 2,
    description: null,
    maxOrderTotal: 7000,
  },
];

describe('CheckoutPaymentOptions', () => {
  it('shows the payment type description under the secure payment badge', () => {
    renderWithTamagui(
      <CheckoutPaymentOptions
        isLoading={false}
        methods={methods}
        onSelect={jest.fn()}
        orderTotal={1000}
        selectedSlug="credit_card"
      />,
    );

    expect(screen.getByText('%100 Güvenli Ödeme')).toBeTruthy();
    expect(screen.getByText('Peşin fiyatına 3 taksit')).toBeTruthy();
    expect(screen.getByText(/19,99/)).toBeTruthy();
  });

  it('ignores presses while the checkout is locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutPaymentOptions
        disabled
        isLoading={false}
        methods={methods}
        onSelect={onSelect}
        orderTotal={1000}
        selectedSlug="credit_card"
      />,
    );

    fireEvent.press(screen.getByLabelText('Kapıda Nakit Ödeme'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not show the max-order cap warning just because the checkout is locked', () => {
    renderWithTamagui(
      <CheckoutPaymentOptions
        disabled
        isLoading={false}
        methods={methods}
        onSelect={jest.fn()}
        orderTotal={1000}
        selectedSlug="credit_card"
      />,
    );

    expect(screen.queryByText(/yalnızca kart ile ödeme yapılabilir/)).toBeNull();
  });

  it('still shows the cap warning for a method that is genuinely over its limit', () => {
    renderWithTamagui(
      <CheckoutPaymentOptions
        isLoading={false}
        methods={methods}
        onSelect={jest.fn()}
        orderTotal={9000}
        selectedSlug="credit_card"
      />,
    );

    expect(screen.getByText(/yalnızca kart ile ödeme yapılabilir/)).toBeTruthy();
  });
});
