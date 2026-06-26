import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CheckoutSummaryBackdrop } from './checkout-summary-backdrop';

describe('CheckoutSummaryBackdrop', () => {
  it('renders a dismissible backdrop when summary is expanded', () => {
    const onPress = jest.fn();

    renderWithTamagui(<CheckoutSummaryBackdrop onPress={onPress} visible />);
    fireEvent.press(screen.getByTestId('checkout-summary-backdrop'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('stays dismissible in dark mode', () => {
    const onPress = jest.fn();

    renderWithTamagui(<CheckoutSummaryBackdrop onPress={onPress} visible />, 'dark');
    fireEvent.press(screen.getByTestId('checkout-summary-backdrop'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render when summary is collapsed', () => {
    renderWithTamagui(<CheckoutSummaryBackdrop onPress={jest.fn()} visible={false} />);

    expect(screen.queryByTestId('checkout-summary-backdrop')).toBeNull();
  });
});
