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
const mockUpdateVariantQuantity = jest.fn();
const mockRemoveVariant = jest.fn();
const mockUpdateBundleQuantity = jest.fn();
const mockRemoveBundle = jest.fn();

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartQuery: () => ({
    data: undefined,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: jest.fn(async () => ({})),
  }),
  useClearCartMutation: () => ({ isPending: false, mutate: jest.fn() }),
  useRemoveCartItemMutation: () => ({ isPending: false, mutate: mockRemoveVariant }),
  useUpdateBundleQuantityMutation: () => ({
    isPending: false,
    mutate: mockUpdateBundleQuantity,
    variables: undefined,
  }),
  useRemoveBundleMutation: () => ({ isPending: false, mutate: mockRemoveBundle }),
  useUpdateCartItemMutation: () => ({
    isPending: false,
    mutate: mockUpdateVariantQuantity,
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

const mockOfferIfEligible = jest.fn(async () => false);
let mockContinueAsNewOrder: (() => void) | undefined;

jest.mock('@/features/order-merge/hooks/use-order-merge-offer', () => ({
  useOrderMergeOffer: ({ onContinueAsNewOrder }: { onContinueAsNewOrder: () => void }) => {
    mockContinueAsNewOrder = onContinueAsNewOrder;
    return { isChecking: false, offerIfEligible: mockOfferIfEligible };
  },
}));

describe('useCartController checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOfferIfEligible.mockResolvedValue(false);
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
    expect(mockPush).toHaveBeenCalledWith('/address-form');
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

  // Onaylanmış siparişe ekleme teklifi açılırsa yeni sipariş taslağı (/order/prepare) oluşturulmaz.
  it('offers the approved order first and does not prepare a new order', async () => {
    mockOfferIfEligible.mockResolvedValue(true);

    const { result } = renderHook(() => useCartController());
    await act(async () => {
      await result.current.checkout();
    });

    expect(mockOfferIfEligible).toHaveBeenCalledTimes(1);
    expect(mockCheckoutMutateAsync).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('runs the normal checkout when the customer continues as a new order', async () => {
    mockCheckoutMutateAsync.mockResolvedValue({ orderToken: 'tok-2', status: 'ready' });
    renderHook(() => useCartController());

    await act(async () => {
      mockContinueAsNewOrder?.();
    });

    expect(mockCheckoutMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/checkout',
      params: { orderToken: 'tok-2' },
    });
  });

  it('asks guests to log in before checking for an approved order', async () => {
    const { isAuthenticated } = jest.requireMock('@/features/auth/api/auth-session');
    isAuthenticated.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useCartController());
    await act(async () => {
      await result.current.checkout();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Giriş Yapın', expect.any(String), expect.any(Array));
    expect(mockOfferIfEligible).not.toHaveBeenCalled();
    expect(mockCheckoutMutateAsync).not.toHaveBeenCalled();
  });
});

describe('useCartController — bundle satırı', () => {
  const bundleLine: CartLineItem = {
    imageUrl: 'https://example.com/bundle.jpg',
    productId: '97045',
    quantity: 1,
    sellerName: '',
    title: 'Deneme bundle',
    unitPrice: 5000,
    itemType: 'bundle',
    bundleGroupId: '101703d9',
  };

  const variantLine = mockItems[0];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  it('sends a package quantity change to the bundle endpoint', () => {
    const { result } = renderHook(() => useCartController());

    act(() => result.current.changeQuantity(bundleLine, 2));

    expect(mockUpdateBundleQuantity).toHaveBeenCalledTimes(1);
    expect(mockUpdateBundleQuantity.mock.calls[0][0]).toEqual({
      bundleGroupId: '101703d9',
      quantity: 2,
    });
    // Bundle'da `variant_id` ile çalışan uç KULLANILMAZ.
    expect(mockUpdateVariantQuantity).not.toHaveBeenCalled();
  });

  it('removes the package as one piece through the bundle endpoint', () => {
    const { result } = renderHook(() => useCartController());

    act(() => {
      result.current.requestRemove(bundleLine);
    });
    act(() => {
      result.current.confirmRemove();
    });

    expect(mockRemoveBundle).toHaveBeenCalledWith('101703d9', expect.anything());
    expect(mockRemoveVariant).not.toHaveBeenCalled();
  });

  it('keeps normal products on the variant endpoints', () => {
    const { result } = renderHook(() => useCartController());

    act(() => result.current.changeQuantity(variantLine, 3));

    expect(mockUpdateVariantQuantity.mock.calls[0][0]).toEqual({ variantId: '200', quantity: 3 });
    expect(mockUpdateBundleQuantity).not.toHaveBeenCalled();
  });

  it('never sends a request for a package without a group id', () => {
    const { result } = renderHook(() => useCartController());

    act(() => result.current.changeQuantity({ ...bundleLine, bundleGroupId: undefined }, 2));

    expect(mockUpdateBundleQuantity).not.toHaveBeenCalled();
    expect(mockUpdateVariantQuantity).not.toHaveBeenCalled();
  });

  it('tells the user why a quantity change failed instead of failing silently', () => {
    const { result } = renderHook(() => useCartController());

    act(() => result.current.changeQuantity(bundleLine, 2));
    act(() =>
      mockUpdateBundleQuantity.mock.calls[0][1].onError({
        isAxiosError: true,
        response: { status: 400, data: { message: 'Pakette yeterli stok yok.' } },
      }),
    );

    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Pakette yeterli stok yok.');
  });

  it('tells the user why a removal failed', () => {
    const { result } = renderHook(() => useCartController());

    act(() => {
      result.current.requestRemove(bundleLine);
    });
    act(() => {
      result.current.confirmRemove();
    });
    act(() => mockRemoveBundle.mock.calls[0][1].onError(new Error('Network Error')));

    // Teknik hata metni değil, kullanıcıya yazılmış Türkçe mesaj gösterilir.
    expect(Alert.alert).toHaveBeenCalledWith(
      'Hata',
      'Ürün sepetten çıkarılamadı. Lütfen tekrar deneyin.',
    );
  });

  it('applies the same failure notice to normal products', () => {
    const { result } = renderHook(() => useCartController());

    act(() => result.current.changeQuantity(variantLine, 3));
    act(() => mockUpdateVariantQuantity.mock.calls[0][1].onError({ isAxiosError: true, response: { status: 500 } }));

    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Adet güncellenemedi. Lütfen tekrar deneyin.');
  });
});
