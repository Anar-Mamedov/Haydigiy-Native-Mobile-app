import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useCartController } from './use-cart-controller';
import type { CartLineItem } from '@/types/cart.types';

type AlertButton = { text: string; onPress?: () => void };

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
    push: mockPush,
    replace: jest.fn(),
  }),
}));

const mockItems: CartLineItem[] = [
  {
    imageUrl: 'https://example.com/p.jpg',
    productId: '100',
    quantity: 1,
    sellerName: 'Satıcı',
    title: 'Ürün',
    unitPrice: 449.95,
    variantId: '200',
  },
];

jest.mock('@/features/cart/store/use-cart-store', () => {
  const actual = jest.requireActual('@/features/cart/store/use-cart-store');
  return {
    ...actual,
    useCartStore: (selector: (state: { items: CartLineItem[] }) => unknown) =>
      selector({ items: mockItems }),
  };
});

const mockCheckoutMutateAsync = jest.fn();

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartQuery: () => ({
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: jest.fn(async () => ({})),
  }),
  useClearCartMutation: () => ({ isPending: false, mutate: jest.fn() }),
  useRemoveCartItemMutation: () => ({ isPending: false, mutate: jest.fn() }),
  useUpdateCartItemMutation: () => ({
    isPending: false,
    mutate: jest.fn(),
    variables: undefined,
  }),
}));

jest.mock('@/features/shipping/api/shipping.queries', () => ({
  useShippingEstimateQuery: () => ({ data: undefined }),
}));

jest.mock('@/features/checkout/api/checkout.mutations', () => ({
  useCheckoutMutation: () => ({
    isPending: false,
    mutateAsync: mockCheckoutMutateAsync,
  }),
}));

jest.mock('@/features/favorite/api/favorite.queries', () => ({
  useAddFavoriteMutation: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/features/auth/api/auth-session', () => ({
  isAuthenticated: jest.fn(async () => true),
}));

describe('useCartController checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  // Regression: adres yokken kullanıcı "Profilime Git" ile profile değil,
  // "Adres Ekle" ile doğrudan adres formuna gitmeli; form kayıt sonrası
  // router.back() çağırdığı için kullanıcı sepete geri döner.
  it('routes to the add-address form when checkout reports no_address', async () => {
    mockCheckoutMutateAsync.mockResolvedValue({ status: 'no_address' });

    const { result } = renderHook(() => useCartController());
    await act(async () => {
      await result.current.checkout();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Adres Gerekli',
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ text: 'Adres Ekle' })]),
    );
    expect(mockPush).not.toHaveBeenCalled();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as AlertButton[];
    const addAddressButton = buttons.find((button) => button.text === 'Adres Ekle');
    expect(addAddressButton?.onPress).toBeDefined();

    act(() => addAddressButton?.onPress?.());
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/address-form');
  });

  it('continues to checkout when the order is prepared with an address', async () => {
    mockCheckoutMutateAsync.mockResolvedValue({ orderToken: 'tok-1', status: 'ready' });

    const { result } = renderHook(() => useCartController());
    await act(async () => {
      await result.current.checkout();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/checkout',
      params: { orderToken: 'tok-1' },
    });
  });
});
