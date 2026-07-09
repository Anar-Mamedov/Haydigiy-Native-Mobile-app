import { fireEvent, screen } from '@testing-library/react-native';
import { BottomNavigationBar } from '@/components/navigation/bottom-navigation-bar';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockPush = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
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

  it('shows the cart badge count', () => {
    renderWithTamagui(<BottomNavigationBar />);

    expect(screen.getByText('2')).toBeTruthy();
  });
});
