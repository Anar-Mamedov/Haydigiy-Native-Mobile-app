import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundleBuySingleButton, BundleBuySingleButtonProps, resolveBuySingleLabel } from './bundle-buy-single-button';

function renderButton(overrides: Partial<BundleBuySingleButtonProps> = {}, theme?: 'light' | 'dark') {
  const onBuy = overrides.onBuy ?? jest.fn();
  renderWithTamagui(
    <BundleBuySingleButton
      disabled={false}
      hasSelectedSize={false}
      isAdded={false}
      isBuying={false}
      itemTitle="Dolgulu Sütyen Siyah"
      {...overrides}
      onBuy={onBuy}
    />,
    theme,
  );
  return { onBuy };
}

describe('resolveBuySingleLabel', () => {
  it('invites a purchase while no size is picked', () => {
    expect(resolveBuySingleLabel({ isAdded: false, hasSelectedSize: false })).toBe('Tekli Satın Al');
  });

  it('offers to add the picked size straight to the cart', () => {
    expect(resolveBuySingleLabel({ isAdded: false, hasSelectedSize: true })).toBe('Tekli Sepete Ekle');
  });

  it('confirms the add before anything else', () => {
    expect(resolveBuySingleLabel({ isAdded: true, hasSelectedSize: true })).toBe('Tekli Ürün Eklendi');
  });
});

describe('BundleBuySingleButton', () => {
  it('calls the handler when pressed', () => {
    const { onBuy } = renderButton();

    fireEvent.press(screen.getByLabelText('Dolgulu Sütyen Siyah, Tekli Satın Al'));

    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  it('names the visible label to screen readers', () => {
    renderButton({ hasSelectedSize: true });

    expect(screen.getByText('Tekli Sepete Ekle')).toBeTruthy();
    expect(screen.getByLabelText('Dolgulu Sütyen Siyah, Tekli Sepete Ekle')).toBeTruthy();
  });

  it('shows a loading indicator instead of the label and ignores presses while adding', () => {
    const { onBuy } = renderButton({ hasSelectedSize: true, isBuying: true });

    expect(screen.getByTestId('bundle-buy-single-spinner')).toBeTruthy();
    expect(screen.queryByText('Tekli Sepete Ekle')).toBeNull();

    const button = screen.getByLabelText('Dolgulu Sütyen Siyah, Ekleniyor');
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('stays visible but cannot be pressed when disabled', () => {
    const { onBuy } = renderButton({ disabled: true });

    const button = screen.getByLabelText('Dolgulu Sütyen Siyah, Tekli Satın Al');
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('keeps every label readable in the dark theme', () => {
    renderButton({ hasSelectedSize: true, isAdded: true }, 'dark');

    expect(screen.getByText('Tekli Ürün Eklendi')).toBeTruthy();
  });
});
