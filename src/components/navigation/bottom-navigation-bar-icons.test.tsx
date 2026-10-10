import { screen, within } from '@testing-library/react-native';
import { BottomNavigationBar } from '@/components/navigation/bottom-navigation-bar';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { renderWithTamagui } from '@/test/render-with-tamagui';

let mockPathname = '/';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartCount: () => 0,
}));

// Header'ın kullandığı paylaşılan ikonlar; hangisinin çizildiği testID'den okunur.
jest.mock('@/components/ui/icons', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const mockIcon = (name: string) =>
    function MockIcon(props: Record<string, unknown>) {
      return React.createElement(View, { ...props, testID: `icon-${name}` });
    };

  return {
    ...jest.requireActual('@/components/ui/icons'),
    Heart: mockIcon('Heart'),
    Home: mockIcon('Home'),
    Menu: mockIcon('Menu'),
    ShoppingCart: mockIcon('ShoppingCart'),
    UserRound: mockIcon('UserRound'),
  };
});

const TAB_ICONS: [label: string, icon: string][] = [
  ['Anasayfa', 'Home'],
  ['Kategoriler', 'Menu'],
  ['Favorilerim', 'Heart'],
  ['Sepetim', 'ShoppingCart'],
  ['Hesabım', 'UserRound'],
];

describe('BottomNavigationBar icons', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('draws each tab with the same icon the app header uses', () => {
    renderWithTamagui(<BottomNavigationBar />);

    for (const [label, icon] of TAB_ICONS) {
      expect(within(screen.getByLabelText(label)).getByTestId(`icon-${icon}`)).toBeTruthy();
    }
  });

  it('sizes the icons for the tab bar and caps them at the compact font scale', () => {
    renderWithTamagui(<BottomNavigationBar />);

    for (const [label, icon] of TAB_ICONS) {
      const tabIcon = within(screen.getByLabelText(label)).getByTestId(`icon-${icon}`);
      expect(tabIcon.props.size).toBe(25);
      expect(tabIcon.props.maxFontScale).toBe(COMPACT_MAX_FONT_SCALE);
    }
  });

  it('fills the favorites heart with the brand color only while that tab is selected', () => {
    const { unmount } = renderWithTamagui(<BottomNavigationBar />);
    const idleHeart = within(screen.getByLabelText('Favorilerim')).getByTestId('icon-Heart');
    expect(idleHeart.props.fill).toBe('none');
    expect(within(screen.getByLabelText('Anasayfa')).getByTestId('icon-Home').props.color).toBe(BRAND_COLOR);
    unmount();

    mockPathname = '/favorites';
    renderWithTamagui(<BottomNavigationBar />);
    const selectedHeart = within(screen.getByLabelText('Favorilerim')).getByTestId('icon-Heart');
    expect(selectedHeart.props.fill).toBe(BRAND_COLOR);
    expect(selectedHeart.props.color).toBe(BRAND_COLOR);
  });

  it('keeps the other icons outlined when their tab is selected', () => {
    mockPathname = '/cart';
    renderWithTamagui(<BottomNavigationBar />);

    const cartIcon = within(screen.getByLabelText('Sepetim')).getByTestId('icon-ShoppingCart');
    expect(cartIcon.props.color).toBe(BRAND_COLOR);
    expect(cartIcon.props.fill).toBe('none');
  });
});
