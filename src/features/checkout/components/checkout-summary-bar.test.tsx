import { StyleSheet } from 'react-native';
import { screen, within } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutSummaryBar, CheckoutSummaryBarProps } from './checkout-summary-bar';

const baseProps: CheckoutSummaryBarProps = {
  summary: {
    subtotal: 399.99,
    userDiscount: 0,
    campaignDiscount: 0,
    couponDiscount: 40,
    cargoPrice: 119.99,
    serviceFee: 19.99,
    commissionRate: 0,
    commission: 0,
    installmentCount: 1,
    installmentFee: 0,
    totalPrice: 499.97,
    isFreeShippingCoupon: false,
  },
  isSummaryLoading: false,
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

  it('renders the expanded amounts from the order-token summary model', () => {
    renderWithTamagui(<CheckoutSummaryBar {...baseProps} expanded />);

    expect(screen.getByText('₺399,99')).toBeTruthy();
    expect(screen.getByText('- ₺40,00')).toBeTruthy();
    expect(screen.getByText('₺19,99')).toBeTruthy();
    expect(screen.getByText('₺119,99')).toBeTruthy();
    expect(screen.getAllByText('₺499,97')).toHaveLength(2);
  });

  it('does not retain an old total while the latest API summary is loading', () => {
    renderWithTamagui(<CheckoutSummaryBar {...baseProps} isSummaryLoading summary={null} />);

    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.queryByText('₺499,97')).toBeNull();
  });

  it('announces a submit error accessibly', () => {
    renderWithTamagui(
      <CheckoutSummaryBar {...baseProps} submitError="Ödeme işlemi başlatılamadı." />,
    );

    expect(screen.getByText('Ödeme işlemi başlatılamadı.')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
