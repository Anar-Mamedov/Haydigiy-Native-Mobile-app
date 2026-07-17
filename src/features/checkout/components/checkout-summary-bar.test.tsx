import { StyleSheet } from 'react-native';
import { screen, within } from '@testing-library/react-native';
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

  it('can skip bottom safe-area padding when rendered above the tab bar', () => {
    renderWithTamagui(<CheckoutSummaryBar {...baseProps} reserveBottomSafeArea={false} />);

    expect(StyleSheet.flatten(screen.getByTestId('checkout-summary-bar').props.style)).toEqual(
      expect.objectContaining({ paddingBottom: 0 }),
    );
  });

  it('renders the payment hint below the total and submit actions', () => {
    renderWithTamagui(<CheckoutSummaryBar {...baseProps} />);

    const actions = screen.getByTestId('checkout-summary-actions');

    expect(within(actions).getByText('Toplam')).toBeTruthy();
    expect(within(actions).getByText('Onayla ve Bitir')).toBeTruthy();
    expect(within(actions).queryByText(baseProps.hint!)).toBeNull();
    expect(screen.getByTestId('checkout-summary-hint')).toHaveTextContent(baseProps.hint!);
  });

  it('announces a submit error accessibly', () => {
    renderWithTamagui(
      <CheckoutSummaryBar
        {...baseProps}
        submitError="Ödeme işlemi başlatılamadı."
      />,
    );

    expect(screen.getByText('Ödeme işlemi başlatılamadı.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
