import { Text } from 'react-native';
import { fireEvent, screen, within } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartLineItem } from '@/types/cart.types';
import { CartScreen } from './cart-screen';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  usePathname: () => '/cart',
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

let mockController: Record<string, unknown>;
jest.mock('@/features/cart/hooks/use-cart-controller', () => ({
  useCartController: () => mockController,
}));
jest.mock('@/features/promotions/components/top-banner', () => ({ TopBanner: () => null }));
jest.mock('@/features/insider/hooks/use-insider-page-tracking', () => ({ useTrackCartPageView: jest.fn() }));
jest.mock('@/features/insider/components/insider-recommendation-sections', () => ({
  InsiderRecommendationSections: () => null,
}));
jest.mock('@/features/order-merge/components/order-merge-offer-sheet', () => ({ OrderMergeOfferSheet: () => null }));
jest.mock('@/features/cart/components/available-gifts-card', () => ({
  AvailableGiftsCard: () => {
    const { Text: MockText } = jest.requireActual('react-native');
    return <MockText testID="available-gifts-card">Hediyenizi seçin</MockText>;
  },
}));
jest.mock('@/features/shipping/components/shipping-estimate-info', () => ({
  ShippingEstimateInfo: () => {
    const { Text: MockText } = jest.requireActual('react-native');
    return <MockText testID="shipping-estimate-info">Tahmini kargo</MockText>;
  },
}));

const line = (overrides: Partial<CartLineItem>): CartLineItem => ({
  imageUrl: '',
  productId: '1',
  quantity: 1,
  sellerName: '',
  title: 'Ürün',
  unitPrice: 100,
  itemType: 'product',
  ...overrides,
});

const DRESS = line({ title: 'Kemerli Elbise', productId: '11', variantId: '11', cartItemId: '901' });
const ATTACHED_GIFT = line({
  title: 'Pamuklu Çorap',
  productId: '77',
  variantId: '31',
  cartItemId: '950',
  unitPrice: 0,
  isGift: true,
  parentLineKey: 'cart:901',
});
const ORPHAN_GIFT = line({
  title: 'Saç Tokası',
  productId: '78',
  variantId: '32',
  cartItemId: '951',
  unitPrice: 0,
  isGift: true,
  parentLineKey: 'cart:404',
});

function renderScreen(items: CartLineItem[]) {
  const requestRemove = jest.fn();
  mockController = {
    items,
    itemCount: items.length,
    syncCart: jest.fn(),
    isLoading: false,
    isSyncing: false,
    isError: false,
    shippingEstimate: { message: 'Yarın kargoda' },
    availableGifts: [],
    campaigns: [],
    subtotal: 100,
    total: 100,
    removedMessage: null,
    dismissRemovedMessage: jest.fn(),
    goBack: jest.fn(),
    requestClear: jest.fn(),
    requestRemove,
    openProduct: jest.fn(),
    openProductBySlug: jest.fn(),
    changeQuantity: jest.fn(),
    updatingLineKey: null,
    isSummaryExpanded: false,
    isCheckingOut: false,
    checkout: jest.fn(),
    toggleSummary: jest.fn(),
    removeTarget: null,
    closeRemoveDialog: jest.fn(),
    confirmRemove: jest.fn(),
    confirmRemoveAndFavorite: jest.fn(),
    isClearDialogOpen: false,
    setIsClearDialogOpen: jest.fn(),
    confirmClear: jest.fn(),
    orderMerge: {
      isOpen: false,
      isSubmitting: false,
      offer: null,
      accept: jest.fn(),
      continueAsNewOrder: jest.fn(),
      dismiss: jest.fn(),
    },
  };
  renderWithTamagui(<CartScreen />);
  return { requestRemove };
}

describe('CartScreen — kampanya hediyeleri', () => {
  it('draws a gift under the product card the backend tied it to', () => {
    renderScreen([ATTACHED_GIFT, DRESS]);

    const cards = screen.getAllByTestId('cart-item-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText('Kemerli Elbise')).toBeTruthy();
    expect(within(cards[0]).getByTestId('cart-gift-item-attached')).toBeTruthy();
    expect(screen.queryByTestId('cart-gift-item-card')).toBeNull();
  });

  it('removes an attached gift through the normal remove flow', () => {
    const { requestRemove } = renderScreen([DRESS, ATTACHED_GIFT]);

    fireEvent.press(screen.getByLabelText('Pamuklu Çorap hediyesini sil'));

    expect(requestRemove).toHaveBeenCalledWith(ATTACHED_GIFT);
  });

  it('keeps a gift whose parent is not in the cart on its own card', () => {
    renderScreen([DRESS, ORPHAN_GIFT]);

    expect(screen.getByTestId('cart-gift-item-card')).toBeTruthy();
    expect(screen.queryByTestId('cart-gift-item-attached')).toBeNull();
  });

  it('shows the gift picker above the shipping estimate', () => {
    renderScreen([DRESS]);

    const texts = screen.UNSAFE_getAllByType(Text).map((node) => node.props.testID).filter(Boolean);
    expect(texts.indexOf('available-gifts-card')).toBeLessThan(texts.indexOf('shipping-estimate-info'));
  });
});
