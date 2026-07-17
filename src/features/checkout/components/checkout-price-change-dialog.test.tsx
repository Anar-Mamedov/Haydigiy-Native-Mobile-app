import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutPriceChangeDialog } from './checkout-price-change-dialog';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const baseProps = {
  open: true,
  message: 'Sipariş tutarı güncellendi: 3009.91 TL.',
  updatedTotal: 3009.91,
  isPreparingInstallments: false,
  canConfirm: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

describe('CheckoutPriceChangeDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the updated total and explicit confirm/cancel actions', () => {
    renderWithTamagui(<CheckoutPriceChangeDialog {...baseProps} />);

    expect(screen.getByText('Fiyat Güncellendi')).toBeTruthy();
    expect(screen.getByText(/Sipariş tutarı güncellendi: 3009.91 TL/)).toBeTruthy();
    expect(screen.getByText(/Yeni toplam: ₺3\.009,91/)).toBeTruthy();
    expect(screen.getByText(/Yeni fiyatla devam etmek için onaylayın/)).toBeTruthy();
    expect(screen.getByText('Onayla')).toBeTruthy();
    expect(screen.getByText('İptal')).toBeTruthy();
  });

  it('forwards explicit confirmation', () => {
    renderWithTamagui(<CheckoutPriceChangeDialog {...baseProps} />);

    fireEvent.press(screen.getByText('Onayla'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('forwards explicit cancellation', () => {
    renderWithTamagui(<CheckoutPriceChangeDialog {...baseProps} />);

    fireEvent.press(screen.getByText('İptal'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps confirmation disabled while refreshed installment prices are loading', () => {
    renderWithTamagui(
      <CheckoutPriceChangeDialog
        {...baseProps}
        canConfirm={false}
        isPreparingInstallments
      />,
    );

    expect(screen.getByText(/Güncel taksit tutarı hesaplanıyor/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Onayla' })).toBeDisabled();
  });
});
