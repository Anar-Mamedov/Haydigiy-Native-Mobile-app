import { fireEvent, screen } from '@testing-library/react-native';
import { ReorderButton } from './reorder-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ReorderButton', () => {
  it('starts the reorder on press', () => {
    const onPress = jest.fn();
    renderWithTamagui(<ReorderButton isLoading={false} onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Siparişi Tekrarla' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('order-reorder-spinner')).toBeNull();
  });

  it('is locked with a spinner while a request runs', () => {
    renderWithTamagui(<ReorderButton isLoading onPress={jest.fn()} />);

    const button = screen.getByRole('button', { name: 'Siparişi Tekrarla' });
    expect(button).toBeDisabled();
    expect(button.props.accessibilityState).toEqual({ busy: true, disabled: true });
    expect(screen.getByTestId('order-reorder-spinner')).toBeTruthy();
  });

  it('keeps its label in the dark theme', () => {
    renderWithTamagui(<ReorderButton isLoading={false} onPress={jest.fn()} />, 'dark');

    expect(screen.getByText('Siparişi Tekrarla')).toBeTruthy();
  });
});
