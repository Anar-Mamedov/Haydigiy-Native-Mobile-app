import { screen } from '@testing-library/react-native';
import { Paragraph } from 'tamagui';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutSummaryBar, CheckoutSummaryBarProps } from './checkout-summary-bar';

const baseProps: CheckoutSummaryBarProps = {
  subtotal: 2339.96,
  userDiscount: 0,
  campaignDiscount: 0,
  couponDiscount: 0,
  isFreeShippingCoupon: false,
  commission: 0,
  commissionRate: 0,
  serviceFee: 0,
  cargoPrice: 99.99,
  hasFreeShipping: false,
  installmentFee: 0,
  installmentCount: 1,
  finalTotal: 2339.96,
  expanded: false,
  onToggle: jest.fn(),
  canSubmit: false,
  isSubmitting: false,
  submitError: null,
  hint: 'Kart bilgilerini eksiksiz doldurun.',
  onSubmit: jest.fn(),
};

describe('CheckoutSummaryBar', () => {
  it('renders the agreement slot as part of the sticky total bar', () => {
    renderWithTamagui(
      <CheckoutSummaryBar
        {...baseProps}
        agreementSlot={<Paragraph>Agreement consent belongs to summary bar</Paragraph>}
      />,
    );

    expect(screen.getByText('Agreement consent belongs to summary bar')).toBeTruthy();
    expect(screen.getByText('Toplam')).toBeTruthy();
    expect(screen.getByText('Onayla ve Bitir')).toBeTruthy();
  });
});
