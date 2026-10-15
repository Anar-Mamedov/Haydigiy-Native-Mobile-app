import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { AppHeader } from '@/components/ui/app-header';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockPush = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCount: () => 3,
}));

function minSizeOf(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockPathname = '/';
  });

  it('gives every home header icon a Turkish label and a 48dp target', () => {
    // Regresyon: 36dp ikon butonları Play "Dokunma hedefi boyutu" uyarısı veriyordu; etiketler İngilizceydi.
    renderWithTamagui(<AppHeader />);

    for (const label of ['Kategoriler', 'Hesabım', 'Favorilerim', 'Sepetim']) {
      expect(minSizeOf(label)).toMatchObject({ minHeight: 48, minWidth: 48 });
    }
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('navigates from the icons', () => {
    renderWithTamagui(<AppHeader />);

    fireEvent.press(screen.getByLabelText('Sepetim'));
    fireEvent.press(screen.getByLabelText('Kategoriler'));

    expect(mockPush).toHaveBeenNthCalledWith(1, '/cart');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/categories');
  });

  it('shows search and favorites on sub pages, also with 48dp targets', () => {
    mockPathname = '/kategori/kis';
    renderWithTamagui(<AppHeader />);

    expect(minSizeOf('Ürün ara')).toMatchObject({ minHeight: 48, minWidth: 48 });
    expect(minSizeOf('Favorilerim')).toMatchObject({ minHeight: 48, minWidth: 48 });
    expect(screen.queryByLabelText('Sepetim')).toBeNull();
  });

  it('keeps the logo button 48dp tall', () => {
    // Regresyon: 32dp logo butonu Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<AppHeader />);

    expect(minSizeOf('Ana sayfa')).toMatchObject({ height: 48 });
  });

  it('renders its actions in the dark theme', () => {
    renderWithTamagui(<AppHeader />, 'dark');

    expect(screen.getByLabelText('Kategoriler')).toBeTruthy();
    expect(screen.getByLabelText('Sepetim')).toBeTruthy();
  });
});
