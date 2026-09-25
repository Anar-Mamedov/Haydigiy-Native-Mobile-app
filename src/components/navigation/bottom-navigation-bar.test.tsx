import { fireEvent, screen, within } from '@testing-library/react-native';
import { BottomNavigationBar } from '@/components/navigation/bottom-navigation-bar';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCount: () => 2,
}));

describe('BottomNavigationBar', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockPathname = '/';
  });

  it('pushes tab routes so native stack transitions can animate', () => {
    renderWithTamagui(<BottomNavigationBar />);

    fireEvent.press(screen.getByLabelText('Kategoriler'));

    expect(mockPush).toHaveBeenCalledWith('/categories');
  });

  it('does not push the active tab again', () => {
    mockPathname = '/cart';

    renderWithTamagui(<BottomNavigationBar />);

    fireEvent.press(screen.getByLabelText('Sepetim'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('returns to the home root when Home is pressed from a category route', () => {
    mockPathname = '/kategori/sicak-yaz-indirimleri';

    renderWithTamagui(<BottomNavigationBar />);

    fireEvent.press(screen.getByLabelText('Anasayfa'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('keeps the user on the home root when Home is pressed on the home route', () => {
    renderWithTamagui(<BottomNavigationBar />);

    fireEvent.press(screen.getByLabelText('Anasayfa'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows the cart badge count', () => {
    renderWithTamagui(<BottomNavigationBar />);

    expect(screen.getByText('2')).toBeTruthy();
  });

  it('anchors the cart badge to the cart icon instead of the whole tab column', () => {
    // Rozet ikon + etiket kolonuna çapalandığında "Sepetim" yazısının hizasına
    // kayıyordu; çapa yalnızca ikonu saran kutu olmalı.
    renderWithTamagui(<BottomNavigationBar />);

    const anchor = within(screen.getByTestId('cart-tab-icon'));

    expect(anchor.getByTestId('cart-tab-badge')).toBeTruthy();
    expect(anchor.queryByText('Sepetim')).toBeNull();
  });

  it('grows the cart badge together with the tab icon under a large OS font', () => {
    // Test ortamı OS yazı ölçeğini 2 veriyor; alt menü bunu 1.1'e kırpar (18 → 20).
    // Rakam da hapla aynı ölçüden türer, OS onu ayrıca büyütmez.
    renderWithTamagui(<BottomNavigationBar />);

    expect(screen.getByTestId('cart-tab-badge')).toHaveStyle({ height: 20, minWidth: 20 });
    expect(screen.getByText('2')).toHaveStyle({ fontSize: 11, lineHeight: 20 });
    expect(screen.getByText('2').props.allowFontScaling).toBe(false);
  });

  it('draws the badge only on the cart tab', () => {
    renderWithTamagui(<BottomNavigationBar />);

    expect(screen.getAllByTestId(/-tab-badge$/)).toHaveLength(1);
    expect(screen.getByTestId('cart-tab-badge')).toBeTruthy();
  });

  it('shrinks a label that does not fit its tab instead of cutting it off', () => {
    // Büyük yazı ayarında "Favorilerim" dar ekranda "Favorileri…" diye kesiliyordu.
    renderWithTamagui(<BottomNavigationBar />);

    for (const label of ['Favorilerim', 'Whatsapp', 'Hesabım']) {
      expect(screen.getByText(label).props.adjustsFontSizeToFit).toBe(true);
    }
  });
});
