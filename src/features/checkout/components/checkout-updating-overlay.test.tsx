import { screen } from '@testing-library/react-native';
import { CheckoutUpdatingOverlay } from './checkout-updating-overlay';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('CheckoutUpdatingOverlay', () => {
  it('renders nothing while it is not visible', () => {
    renderWithTamagui(<CheckoutUpdatingOverlay visible={false} />);

    expect(screen.queryByTestId('checkout-updating-overlay')).toBeNull();
  });

  it('shows the updating message when visible', () => {
    renderWithTamagui(<CheckoutUpdatingOverlay visible />);

    expect(screen.getByTestId('checkout-updating-overlay')).toBeTruthy();
    expect(screen.getByText('Sipariş tutarları güncelleniyor...')).toBeTruthy();
  });

  it('lets touches through so the page can still be scrolled', () => {
    renderWithTamagui(<CheckoutUpdatingOverlay visible />);

    expect(screen.getByTestId('checkout-updating-overlay').props.pointerEvents).toBe('none');
  });

  it('keeps its label readable in dark mode', () => {
    renderWithTamagui(<CheckoutUpdatingOverlay visible />, 'dark');

    expect(screen.getByText('Sipariş tutarları güncelleniyor...')).toBeTruthy();
  });
});
