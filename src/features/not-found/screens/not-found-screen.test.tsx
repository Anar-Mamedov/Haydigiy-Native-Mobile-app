import { fireEvent, screen } from '@testing-library/react-native';
import { NotFoundScreen } from './not-found-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockDismissTo = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ dismissTo: mockDismissTo, push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

describe('NotFoundScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['light', 'dark'] as const)('renders the storefront 404 message in %s theme', (theme) => {
    renderWithTamagui(<NotFoundScreen />, theme);

    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Sayfa Bulunamadı')).toBeTruthy();
    expect(screen.getByText(/İçerik kaldırılmış/)).toBeTruthy();
  });

  it('dismisses the stale stack when navigating home or to categories', () => {
    renderWithTamagui(<NotFoundScreen />);

    fireEvent.press(screen.getByText('Ana Sayfaya Dön'));
    fireEvent.press(screen.getByText('Kategorilere Göz At'));

    expect(mockDismissTo).toHaveBeenNthCalledWith(1, '/');
    expect(mockDismissTo).toHaveBeenNthCalledWith(2, '/categories');
  });

  it('opens the help center', () => {
    renderWithTamagui(<NotFoundScreen />);

    fireEvent.press(screen.getByText('Yardım Merkezi'));

    expect(mockPush).toHaveBeenCalledWith('/help');
  });
});
