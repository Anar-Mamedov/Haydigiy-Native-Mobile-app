import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ScrollToTopButton } from './scroll-to-top-button';

describe('ScrollToTopButton', () => {
  it('renders nothing until the list is scrolled past the threshold', () => {
    renderWithTamagui(<ScrollToTopButton onPress={jest.fn()} visible={false} />);

    expect(screen.queryByLabelText('Sayfanın başına dön')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const handlePress = jest.fn();

    renderWithTamagui(<ScrollToTopButton onPress={handlePress} visible />);

    fireEvent.press(screen.getByLabelText('Sayfanın başına dön'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('stays reachable in dark theme', () => {
    renderWithTamagui(<ScrollToTopButton onPress={jest.fn()} visible />, 'dark');

    expect(screen.getByLabelText('Sayfanın başına dön')).toBeTruthy();
  });
});
