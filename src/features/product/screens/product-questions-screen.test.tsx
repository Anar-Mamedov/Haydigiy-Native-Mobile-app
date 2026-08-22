import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductQuestionsScreen } from './product-questions-screen';
import { useProductQuestionsQuery } from '../api/product-questions.queries';

const mockPush = jest.fn();
const mockAddToCart = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), canGoBack: () => true }),
  useLocalSearchParams: () => ({ slug: 'deneme-bundle' }),
  useFocusEffect: jest.fn(),
  usePathname: () => '/product-questions',
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('../api/product-questions.queries', () => ({
  useProductQuestionsQuery: jest.fn(),
  useAskProductQuestionMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddToCartMutation: () => ({ mutate: mockAddToCart, isPending: false }),
}));

jest.mock('@/features/cart/hooks/use-go-to-cart-after-add', () => ({
  useGoToCartAfterAdd: () => jest.fn(),
}));

jest.mock('@/features/shipping/api/shipping.queries', () => ({
  useShippingEstimateQuery: () => ({ data: undefined }),
}));

jest.mock('../hooks/use-notify-stock', () => ({
  useNotifyStock: () => ({
    closeConfirmation: jest.fn(),
    isConfirmationOpen: false,
    isNotifying: false,
    isVariantNotified: () => false,
    requestNotification: jest.fn(),
  }),
}));

const useQuestionsMock = useProductQuestionsQuery as jest.MockedFunction<
  typeof useProductQuestionsQuery
>;

function makePage(isBundle: boolean) {
  return {
    product: {
      id: '97045',
      name: isBundle ? 'Deneme bundle' : 'Uzun Kollu Gömlek',
      imageUrl: '',
      price: '2000',
      cartCount: 0,
      favoritesCount: 0,
      totalQuantity: 5,
      featureIcons: [],
      // Paket ürünün kendi varyantı yoktur; bedenler paketteki ürünlerde seçilir.
      variants: isBundle ? [] : [{ id: '101', name: 'M', hasStock: true, price: 309.99 }],
      isBundle,
      slug: isBundle ? 'deneme-bundle' : 'uzun-kollu-gomlek',
    },
    tags: [],
    questions: [],
  };
}

function renderScreen(isBundle: boolean) {
  useQuestionsMock.mockReturnValue({
    data: makePage(isBundle),
    isPending: false,
    isError: false,
  } as never);

  return renderWithTamagui(<ProductQuestionsScreen />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProductQuestionsScreen — paket ürün', () => {
  it('sends the shopper to the product detail instead of adding the package with one variant', () => {
    renderScreen(true);

    fireEvent.press(screen.getByText('Sepete Ekle'));

    // Pakette HER ürün için ayrı beden seçilmeli; bu yalnızca detayda yapılabilir.
    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/product/deneme-bundle');
  });

  it('keeps the normal add-to-cart flow for a regular product', () => {
    renderScreen(false);

    fireEvent.press(screen.getByText('Sepete Ekle'));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
