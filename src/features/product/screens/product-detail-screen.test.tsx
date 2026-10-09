import { fireEvent, render, screen } from '@testing-library/react-native';
import { ProductDetailScreen } from './product-detail-screen';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockRedirect = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({ id: 'kaldirilan-urun' }),
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => mockCanGoBack,
    push: jest.fn(),
    replace: mockReplace,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('@/features/product/api/product.queries', () => ({
  useProductDetailsQuery: jest.fn(),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddToCartMutation: () => ({ mutate: jest.fn() }),
  useAddBundleToCartMutation: () => ({ mutate: jest.fn(), isPending: false }),
  useCartCount: () => 0,
}));

jest.mock('@/features/cart/hooks/use-go-to-cart-after-add', () => ({
  useGoToCartAfterAdd: () => jest.fn(),
}));

jest.mock('@/features/shipping/api/shipping.queries', () => ({
  useShippingEstimateQuery: () => ({}),
}));

jest.mock('@/features/favorite/api/favorite.queries', () => ({
  useToggleFavorite: () => ({ isFavorite: false, toggleFavorite: jest.fn() }),
}));

jest.mock('@/utils/recently-viewed', () => ({
  trackViewedProduct: jest.fn(),
}));

jest.mock('../hooks/use-preview-color-options', () => ({
  usePreviewColorOptions: () => undefined,
}));

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanGoBack = true;
  });

  it('redirects a removed product to the 404 screen', () => {
    jest.mocked(useProductDetailsQuery).mockReturnValue({
      data: undefined,
      error: { isAxiosError: true, response: { status: 404 } },
      isError: true,
      isPending: false,
      refetch: jest.fn(),
    } as never);

    render(<ProductDetailScreen />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  describe('header back button', () => {
    function renderLoadError() {
      jest.mocked(useProductDetailsQuery).mockReturnValue({
        data: undefined,
        error: new Error('network'),
        isError: true,
        isPending: false,
        refetch: jest.fn(),
      } as never);

      renderWithTamagui(<ProductDetailScreen />);
    }

    it('returns to home when the product was opened from a link with nothing to go back to', () => {
      mockCanGoBack = false;
      renderLoadError();

      fireEvent.press(screen.getByLabelText('Go back'));

      expect(mockReplace).toHaveBeenCalledWith('/');
      expect(mockBack).not.toHaveBeenCalled();
    });

    it('goes back when there is history', () => {
      renderLoadError();

      fireEvent.press(screen.getByLabelText('Go back'));

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
