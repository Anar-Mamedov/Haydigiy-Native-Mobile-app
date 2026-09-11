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

  it('draws the badge only on the cart tab', () => {
    renderWithTamagui(<BottomNavigationBar />);

    expect(screen.getAllByTestId(/-tab-badge$/)).toHaveLength(1);
    expect(screen.getByTestId('cart-tab-badge')).toBeTruthy();
  });
});
