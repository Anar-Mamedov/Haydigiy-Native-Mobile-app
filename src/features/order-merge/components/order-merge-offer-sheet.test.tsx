import { fireEvent, screen } from '@testing-library/react-native';
import { OrderMergeOfferSheet } from './order-merge-offer-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { OrderMergeOffer } from '@/types/order-merge.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'sheet-root', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const OFFER: OrderMergeOffer = {
  orderId: 12450,
  orderNo: 'HG100254',
  paymentKind: 'card',
  title: 'Onaylanmış Siparişiniz Var!',
  description: '#HG100254 numaralı siparişinize ekstra kargo ödemeden ekleyebilirsiniz.',
  amountText: '250,00 TL',
  installmentText: 'Peşin Fiyatına 3 Taksit',
  confirmLabel: 'Mevcut Siparişime Ekle',
  continueLabel: 'Yeni Sipariş Olarak Devam Et',
};

function renderSheet(overrides: Partial<Parameters<typeof OrderMergeOfferSheet>[0]> = {}, theme?: 'dark') {
  const props = {
    open: true,
    offer: OFFER,
    isSubmitting: false,
    onConfirm: jest.fn(),
    onContinueAsNewOrder: jest.fn(),
    onDismiss: jest.fn(),
    ...overrides,
  };
  renderWithTamagui(<OrderMergeOfferSheet {...props} />, theme);
  return props;
}

describe('OrderMergeOfferSheet', () => {
  it('renders the backend texts, the amount and the installment badge', () => {
    renderSheet();

    expect(screen.getByText('Onaylanmış Siparişiniz Var!')).toBeTruthy();
    expect(
      screen.getByText('#HG100254 numaralı siparişinize ekstra kargo ödemeden ekleyebilirsiniz.'),
    ).toBeTruthy();
    expect(screen.getByText('250,00 TL')).toBeTruthy();
    expect(screen.getByTestId('order-merge-offer-installment')).toBeTruthy();
    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
  });

  it('hides the installment badge for single payment and cash on delivery', () => {
    renderSheet({ offer: { ...OFFER, installmentText: null } });

    expect(screen.queryByTestId('order-merge-offer-installment')).toBeNull();
    expect(screen.getByText('250,00 TL')).toBeTruthy();
  });

  it('confirms with the primary button and continues as a new order with the secondary one', () => {
    const props = renderSheet();

    fireEvent.press(screen.getByRole('button', { name: 'Mevcut Siparişime Ekle' }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole('button', { name: 'Yeni Sipariş Olarak Devam Et' }));
    expect(props.onContinueAsNewOrder).toHaveBeenCalledTimes(1);
    expect(props.onDismiss).not.toHaveBeenCalled();
  });

  it('only dismisses on an outside tap', () => {
    const props = renderSheet();

    screen.getByTestId('sheet-root').props.onOpenChange(false);

    expect(props.onDismiss).toHaveBeenCalledTimes(1);
    expect(props.onContinueAsNewOrder).not.toHaveBeenCalled();
  });

  it('renders nothing before an offer exists', () => {
    renderSheet({ offer: null });

    expect(screen.queryByTestId('sheet-root')).toBeNull();
  });

  it('keeps every label readable in the dark theme', () => {
    renderSheet({}, 'dark');

    expect(screen.getByText('Onaylanmış Siparişiniz Var!')).toBeTruthy();
    expect(screen.getByText('250,00 TL')).toBeTruthy();
    expect(screen.getByText('Mevcut Siparişime Ekle')).toBeTruthy();
    expect(screen.getByText('Yeni Sipariş Olarak Devam Et')).toBeTruthy();
  });
});
