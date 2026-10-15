import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { ProductDetailHeader } from './product-detail-header';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCount: () => 12,
}));

describe('ProductDetailHeader', () => {
  beforeEach(() => mockPush.mockClear());

  it('gives every header action a Turkish label and a 48dp target', () => {
    // Regresyon: 36dp ikonlar ve 36dp arama kutusu Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<ProductDetailHeader onBack={jest.fn()} />);

    for (const label of ['Geri dön', 'Ana sayfa', 'Kategoriler', 'Sepetim', 'Hesabım']) {
      expect(StyleSheet.flatten(screen.getByLabelText(label).props.style)).toMatchObject({ minHeight: 48, minWidth: 48 });
    }
    expect(StyleSheet.flatten(screen.getByLabelText('Ürün ve kategori ara').props.style)).toMatchObject({ minHeight: 48 });
    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('wires back, search and shortcut actions', () => {
    const onBack = jest.fn();
    renderWithTamagui(<ProductDetailHeader onBack={onBack} />);

    fireEvent.press(screen.getByLabelText('Geri dön'));
    fireEvent.press(screen.getByLabelText('Ürün ve kategori ara'));
    fireEvent.press(screen.getByLabelText('Sepetim'));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenNthCalledWith(1, '/search-suggestions');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/cart');
  });

  it('renders in the dark theme', () => {
    renderWithTamagui(<ProductDetailHeader onBack={jest.fn()} />, 'dark');

    expect(screen.getByLabelText('Geri dön')).toBeTruthy();
    expect(screen.getByText('Ürün ve kategori ara')).toBeTruthy();
  });
});
