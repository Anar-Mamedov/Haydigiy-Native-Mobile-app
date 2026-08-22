import { render } from '@testing-library/react-native';
import { ProductDetailScreen } from './product-detail-screen';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';

const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({ id: 'kaldirilan-urun' }),
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/features/product/api/product.queries', () => ({
  useProductDetailsQuery: jest.fn(),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddToCartMutation: () => ({ mutate: jest.fn() }),
  useAddBundleToCartMutation: () => ({ mutate: jest.fn(), isPending: false }),
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

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
