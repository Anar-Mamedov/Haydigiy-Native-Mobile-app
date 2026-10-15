import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { CartHeader } from './cart-header';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('CartHeader', () => {
  it('shows the item count and a 48dp back button', () => {
    const onBack = jest.fn();
    renderWithTamagui(<CartHeader canClear itemCount={3} onBack={onBack} onClear={jest.fn()} />);

    expect(screen.getByText('Sepetim (3)')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByLabelText('Geri dön').props.style)).toMatchObject({ minHeight: 48, minWidth: 48 });

    fireEvent.press(screen.getByLabelText('Geri dön'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('offers the clear action with a 48dp target while the cart has items', () => {
    const onClear = jest.fn();
    renderWithTamagui(<CartHeader canClear itemCount={2} onBack={jest.fn()} onClear={onClear} />);

    const clear = screen.getByLabelText('Sepeti temizle');
    expect(StyleSheet.flatten(clear.props.style)).toMatchObject({ minHeight: 48 });

    fireEvent.press(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not draw a faded clear action on an empty cart', () => {
    // Regresyon: boş sepette %40 opaklıkla çizilen kırmızı yazı Play kontrast taramasına takılıyordu
    // (1,77:1) ve ekran okuyucuya etkin bir buton gibi görünüyordu.
    renderWithTamagui(<CartHeader canClear={false} itemCount={0} onBack={jest.fn()} onClear={jest.fn()} />);

    expect(screen.queryByLabelText('Sepeti temizle')).toBeNull();
    expect(screen.queryByText('Sepeti Temizle')).toBeNull();
  });

  it('keeps the title and actions in the dark theme', () => {
    renderWithTamagui(<CartHeader canClear itemCount={1} onBack={jest.fn()} onClear={jest.fn()} />, 'dark');

    expect(screen.getByText('Sepetim (1)')).toBeTruthy();
    expect(screen.getByText('Sepeti Temizle')).toBeTruthy();
    expect(screen.getByLabelText('Geri dön')).toBeTruthy();
  });
});
