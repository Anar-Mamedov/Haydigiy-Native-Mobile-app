import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useAddBundleToCartMutation,
  useAddCartGiftMutation,
  useAddToCartMutation,
  useCartCampaignBannerQuery,
  useCartQuery,
  useClearCartMutation,
  useRemoveBundleMutation,
  useRemoveCartItemMutation,
  useUpdateBundleQuantityMutation,
  useUpdateCartItemMutation,
} from './cart.queries';
import { cartKeys } from './cart.keys';
import { useCartStore } from '../store/use-cart-store';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { CartLineItem } from '@/types/cart.types';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  addToCartDto: jest.fn(async () => undefined),
  removeCartItemDto: jest.fn(async () => undefined),
  getCartDto: jest.fn(async () => ({ cart: [] })),
  updateCartItemDto: jest.fn(async () => undefined),
  addBundleToCartDto: jest.fn(async () => undefined),
  updateBundleQuantityDto: jest.fn(async () => undefined),
  removeBundleDto: jest.fn(async () => undefined),
  addCartGiftDto: jest.fn(async () => ({})),
  getCartCampaignsDto: jest.fn(async () => ({ campaigns: [] })),
}));

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    trackAddToCart: jest.fn(),
    trackRemoveFromCart: jest.fn(),
    trackCartCleared: jest.fn(),
  },
}));

const removeCartItemDto = cartService.removeCartItemDto as jest.MockedFunction<
  typeof cartService.removeCartItemDto
>;
const addToCartDto = cartService.addToCartDto as jest.MockedFunction<
  typeof cartService.addToCartDto
>;
const addBundleToCartDto = cartService.addBundleToCartDto as jest.MockedFunction<
  typeof cartService.addBundleToCartDto
>;
const updateBundleQuantityDto = cartService.updateBundleQuantityDto as jest.MockedFunction<
  typeof cartService.updateBundleQuantityDto
>;
const removeBundleDto = cartService.removeBundleDto as jest.MockedFunction<
  typeof cartService.removeBundleDto
>;
const updateCartItemDto = cartService.updateCartItemDto as jest.MockedFunction<
  typeof cartService.updateCartItemDto
>;
const getCartDto = cartService.getCartDto as jest.MockedFunction<typeof cartService.getCartDto>;
const addCartGiftDto = cartService.addCartGiftDto as jest.MockedFunction<
  typeof cartService.addCartGiftDto
>;
const getCartCampaignsDto = cartService.getCartCampaignsDto as jest.MockedFunction<
  typeof cartService.getCartCampaignsDto
>;
const trackerMock = insiderTracker as jest.Mocked<typeof insiderTracker>;

function makeItem(variantId: string): CartLineItem {
  return {
    variantId,
    productId: variantId,
    title: `Ürün ${variantId}`,
    slug: `urun-${variantId}`,
    imageUrl: '',
    sellerName: '',
    quantity: 1,
    unitPrice: 100,
  };
}

/**
 * Bundle satırının `variantId`'si yoktur; sepette `bundle_group_id` ile hedeflenir.
 */
function makeBundleItem(bundleGroupId: string, productId = '97045'): CartLineItem {
  return {
    productId,
    title: 'Deneme bundle',
    imageUrl: '',
    sellerName: '',
    quantity: 1,
    unitPrice: 5000,
    itemType: 'bundle',
    bundleGroupId,
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  removeCartItemDto.mockResolvedValue(undefined);
  addToCartDto.mockResolvedValue(undefined as never);
  addBundleToCartDto.mockResolvedValue(undefined);
  updateBundleQuantityDto.mockResolvedValue(undefined);
  removeBundleDto.mockResolvedValue(undefined);
  updateCartItemDto.mockResolvedValue(undefined);
  getCartDto.mockResolvedValue({ cart: [] });
  addCartGiftDto.mockResolvedValue({});
  getCartCampaignsDto.mockResolvedValue({ campaigns: [] });
  useCartStore.setState({ items: [] });
});

/** Aynı varyantın ücretli ve hediye satırı: backend bunları ayrı `cart_item_id` ile döndürür. */
function makeLine(cartItemId: string, overrides: Partial<CartLineItem> = {}): CartLineItem {
  return { ...makeItem('555'), cartItemId, ...overrides };
}

/** İstemciyi dışarı açan sarmalayıcı; invalidation'ı doğrulamak için. */
function createClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const clientWrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, clientWrapper };
}

describe('useCartQuery', () => {
  // Geri sayım ve satır kampanya fiyatı tamamen backend yanıtına bağlı:
  // `counter`, `campaign_discount` ve `campaign_total` sorgudan UI'a kadar
  // taşınmazsa sayaç hiç görünmez, kampanyalı fiyat da normal fiyata düşer.
  it('carries the campaign counter and line campaign totals from the API response', async () => {
    getCartDto.mockResolvedValue({
      cart: [
        {
          variant_id: 555,
          quantity: 2,
          old_price: '120.00',
          price: '100.00',
          current_price: '100.00',
          stock_quantity: '3',
          in_stock: true,
          product: { id: 42, name: 'Test Ürün', slug: 'test-urun' },
          campaign_discount: 40,
          campaign_total: 160,
        },
      ],
      campaigns: [
        {
          id: 7,
          name: 'Sepette %10 indirim',
          type: 'cart_discount',
          is_applicable: true,
          threshold: 1000,
          remaining: 0,
          end_date: '2026-07-01T00:00:00Z',
          counter: 1,
        },
      ],
    });

    const { result } = renderHook(() => useCartQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.campaigns[0].counter).toBe(1);
    expect(result.current.data?.items[0].campaignDiscount).toBe(40);
    expect(result.current.data?.items[0].campaignTotal).toBe(160);
  });

  it('leaves the counter undefined when the API omits it', async () => {
    getCartDto.mockResolvedValue({
      cart: [],
      campaigns: [
        {
          id: 7,
          name: 'Sepette %10 indirim',
          type: 'cart_discount',
          is_applicable: true,
          threshold: 1000,
          remaining: 0,
        },
      ],
    });

    const { result } = renderHook(() => useCartQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.campaigns[0].counter).toBeUndefined();
  });
});

describe('useClearCartMutation', () => {
  /** Karışık sepette her satır kendi ucuna gider; bunlar normal ürün satırları. */
  const VARIANT_TARGETS = [
    { kind: 'variant' as const, variantId: '11' },
    { kind: 'variant' as const, variantId: '22' },
    { kind: 'variant' as const, variantId: '33' },
  ];

  beforeEach(() => {
    useCartStore.setState({ items: [makeItem('11'), makeItem('22'), makeItem('33')] });
  });

  it('removes every passed variant on the backend even though the store is cleared optimistically', async () => {
    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate(VARIANT_TARGETS);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeCartItemDto).toHaveBeenCalledTimes(3);
    expect(removeCartItemDto).toHaveBeenCalledWith(11, undefined);
    expect(removeCartItemDto).toHaveBeenCalledWith(22, undefined);
    expect(removeCartItemDto).toHaveBeenCalledWith(33, undefined);
    // Optimistic clear leaves the store empty on success.
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('rolls back the optimistic clear when a removal fails', async () => {
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate(VARIANT_TARGETS);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useCartStore.getState().items).toHaveLength(3);
  });

  it('sends the Insider cart-cleared event only on success', async () => {
    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate(VARIANT_TARGETS);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackCartCleared).toHaveBeenCalledTimes(1);
  });

  it('does not send the cart-cleared event when clearing fails', async () => {
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate(VARIANT_TARGETS);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});

describe('useAddToCartMutation', () => {
  it('sends the Insider add-to-cart event with the provided snapshot on success', async () => {
    const { result } = renderHook(() => useAddToCartMutation(), { wrapper });
    const tracking = {
      id: '42',
      name: 'Mavi Elbise',
      taxonomy: ['Elbise'],
      imageUrl: '',
      price: 199.9,
      currency: 'TRY',
    };

    result.current.mutate({ variantId: '77', tracking });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addToCartDto).toHaveBeenCalledWith(77, 1);
    expect(trackerMock.trackAddToCart).toHaveBeenCalledWith(tracking);
  });

  it('skips the add-to-cart event when the request fails or no snapshot exists', async () => {
    const { result } = renderHook(() => useAddToCartMutation(), { wrapper });

    result.current.mutate({ variantId: '77' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(trackerMock.trackAddToCart).not.toHaveBeenCalled();

    addToCartDto.mockRejectedValueOnce(new Error('network'));
    result.current.mutate({
      variantId: '78',
      tracking: {
        id: '43',
        name: 'Kırmızı Elbise',
        taxonomy: ['Elbise'],
        imageUrl: '',
        price: 99.9,
        currency: 'TRY',
      },
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(trackerMock.trackAddToCart).not.toHaveBeenCalled();
  });
});

describe('useRemoveCartItemMutation', () => {
  it('sends remove-from-cart with the product id resolved from the removed line', async () => {
    useCartStore.setState({ items: [makeItem('11'), makeItem('22')] });

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate({ kind: 'variant', variantId: '11' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackRemoveFromCart).toHaveBeenCalledWith('11');
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });

  it('also sends cart-cleared when the last line is removed', async () => {
    useCartStore.setState({ items: [makeItem('11')] });

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate({ kind: 'variant', variantId: '11' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackRemoveFromCart).toHaveBeenCalledWith('11');
    expect(trackerMock.trackCartCleared).toHaveBeenCalledTimes(1);
  });

  it('does not send remove events when the removal fails', async () => {
    useCartStore.setState({ items: [makeItem('11')] });
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate({ kind: 'variant', variantId: '11' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(trackerMock.trackRemoveFromCart).not.toHaveBeenCalled();
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});

describe('useUpdateBundleQuantityMutation', () => {
  it('updates the bundle line optimistically and targets the bundle endpoint', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9'), makeItem('11')] });

    const { result } = renderHook(() => useUpdateBundleQuantityMutation(), { wrapper });

    result.current.mutate({ bundleGroupId: '101703d9', quantity: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateBundleQuantityDto).toHaveBeenCalledWith('101703d9', 3);
    // Bundle'da `variant_id` ile çalışan uç KULLANILMAZ.
    expect(updateCartItemDto).not.toHaveBeenCalled();

    const items = useCartStore.getState().items;
    expect(items[0].quantity).toBe(3);
    // Normal ürün satırı etkilenmez.
    expect(items[1].quantity).toBe(1);
  });

  it('rolls back the optimistic quantity when the request fails', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9')] });
    updateBundleQuantityDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useUpdateBundleQuantityMutation(), { wrapper });

    result.current.mutate({ bundleGroupId: '101703d9', quantity: 4 });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('leaves another package untouched when two bundles share the cart', async () => {
    useCartStore.setState({ items: [makeBundleItem('aaa'), makeBundleItem('bbb', '97046')] });

    const { result } = renderHook(() => useUpdateBundleQuantityMutation(), { wrapper });

    result.current.mutate({ bundleGroupId: 'bbb', quantity: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const items = useCartStore.getState().items;
    expect(items[0].quantity).toBe(1);
    expect(items[1].quantity).toBe(2);
  });
});

describe('useRemoveBundleMutation', () => {
  it('removes only the bundle line and calls the bundle endpoint', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9'), makeItem('11')] });

    const { result } = renderHook(() => useRemoveBundleMutation(), { wrapper });

    result.current.mutate('101703d9');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeBundleDto).toHaveBeenCalledWith('101703d9');
    expect(removeCartItemDto).not.toHaveBeenCalled();

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe('11');
  });

  it('sends remove-from-cart with the package product id', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9'), makeItem('11')] });

    const { result } = renderHook(() => useRemoveBundleMutation(), { wrapper });

    result.current.mutate('101703d9');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackRemoveFromCart).toHaveBeenCalledWith('97045');
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });

  it('also sends cart-cleared when the package was the last line', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9')] });

    const { result } = renderHook(() => useRemoveBundleMutation(), { wrapper });

    result.current.mutate('101703d9');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackCartCleared).toHaveBeenCalledTimes(1);
  });

  it('restores the line and sends no events when the removal fails', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9')] });
    removeBundleDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useRemoveBundleMutation(), { wrapper });

    result.current.mutate('101703d9');
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(trackerMock.trackRemoveFromCart).not.toHaveBeenCalled();
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});

describe('useAddBundleToCartMutation', () => {
  const SELECTIONS = [
    { bundleItemId: 12, variantId: '3512' },
    { bundleItemId: 13, variantId: '3577' },
  ];

  it('posts the package id together with every size selection', async () => {
    const { result } = renderHook(() => useAddBundleToCartMutation(), { wrapper });

    result.current.mutate({ bundleProductId: '97045', selections: SELECTIONS, quantity: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addBundleToCartDto).toHaveBeenCalledWith(97045, SELECTIONS, 2);
    expect(addToCartDto).not.toHaveBeenCalled();
  });

  it('defaults the quantity to one package', async () => {
    const { result } = renderHook(() => useAddBundleToCartMutation(), { wrapper });

    result.current.mutate({ bundleProductId: '97045', selections: SELECTIONS });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addBundleToCartDto).toHaveBeenCalledWith(97045, SELECTIONS, 1);
  });

  it('reports the package as a single Insider add-to-cart product', async () => {
    const tracking = {
      id: '97045',
      name: 'Deneme bundle',
      taxonomy: ['Paket'],
      imageUrl: '',
      price: 5000,
      currency: 'TRY',
    };

    const { result } = renderHook(() => useAddBundleToCartMutation(), { wrapper });

    result.current.mutate({ bundleProductId: '97045', selections: SELECTIONS, tracking });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackAddToCart).toHaveBeenCalledTimes(1);
    expect(trackerMock.trackAddToCart).toHaveBeenCalledWith(tracking);
  });

  it('surfaces the failure and sends no event when the package cannot be added', async () => {
    addBundleToCartDto.mockRejectedValueOnce(new Error('stok yok'));

    const { result } = renderHook(() => useAddBundleToCartMutation(), { wrapper });

    result.current.mutate({
      bundleProductId: '97045',
      selections: SELECTIONS,
      tracking: {
        id: '97045',
        name: 'Deneme bundle',
        taxonomy: ['Paket'],
        imageUrl: '',
        price: 5000,
        currency: 'TRY',
      },
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(trackerMock.trackAddToCart).not.toHaveBeenCalled();
  });
});

describe('useClearCartMutation — karışık sepet', () => {
  it('sends each line to its own endpoint', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9'), makeItem('11')] });

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([
      { kind: 'bundle', bundleGroupId: '101703d9' },
      { kind: 'variant', variantId: '11' },
    ]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeBundleDto).toHaveBeenCalledWith('101703d9');
    expect(removeCartItemDto).toHaveBeenCalledWith(11, undefined);
    expect(removeCartItemDto).toHaveBeenCalledTimes(1);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('rolls the whole cart back when the package removal fails', async () => {
    useCartStore.setState({ items: [makeBundleItem('101703d9'), makeItem('11')] });
    removeBundleDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([
      { kind: 'bundle', bundleGroupId: '101703d9' },
      { kind: 'variant', variantId: '11' },
    ]);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});

describe('useCartQuery — kampanya hediyeleri', () => {
  it('maps the gift row, its cart_item_id and the gifts the customer can still pick', async () => {
    getCartDto.mockResolvedValue({
      cart: [
        {
          cart_item_id: 901,
          variant_id: 555,
          quantity: 1,
          gift_quantity: 0,
          old_price: null,
          price: '100.00',
          current_price: '100.00',
          stock_quantity: '5',
          in_stock: true,
          product: { id: 42, name: 'Pijama', slug: 'pijama' },
        },
        {
          cart_item_id: 902,
          variant_id: 555,
          quantity: 1,
          gift_quantity: 1,
          old_price: null,
          price: '0.00',
          current_price: '0',
          stock_quantity: '5',
          in_stock: true,
          product: { id: 42, name: 'Pijama', slug: 'pijama' },
        },
      ],
      available_gifts: [
        {
          product_id: 77,
          name: 'Çorap',
          image: 'https://cdn/corap.jpg',
          quantity: 1,
          campaign_ids: [12],
          variants: [{ variant_id: 3001, name: 'Standart', available_quantity: 4, can_add: true }],
        },
      ],
    });

    const { result } = renderHook(() => useCartQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [paid, gift] = result.current.data?.items ?? [];
    expect(paid).toMatchObject({ cartItemId: '901', variantId: '555' });
    expect(paid.isGift).toBeUndefined();
    expect(gift).toMatchObject({ cartItemId: '902', variantId: '555', isGift: true, unitPrice: 0 });
    expect(result.current.data?.availableGifts).toEqual([
      expect.objectContaining({ productId: '77', campaignId: '12', quantity: 1 }),
    ]);
  });
});

describe('useUpdateCartItemMutation', () => {
  it('sends cart_item_id and changes only the targeted row when a variant has a gift row too', async () => {
    useCartStore.setState({ items: [makeLine('901'), makeLine('902', { isGift: true, unitPrice: 0 })] });

    const { result } = renderHook(() => useUpdateCartItemMutation(), { wrapper });

    result.current.mutate({ target: { kind: 'variant', variantId: '555', cartItemId: '901' }, quantity: 3 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateCartItemDto).toHaveBeenCalledWith(555, 3, 901);
    const items = useCartStore.getState().items;
    expect(items[0].quantity).toBe(3);
    // Hediye satırı aynı varyantta olsa da etkilenmez.
    expect(items[1].quantity).toBe(1);
  });

  it('falls back to the variant when the backend sent no cart_item_id', async () => {
    useCartStore.setState({ items: [makeItem('11')] });

    const { result } = renderHook(() => useUpdateCartItemMutation(), { wrapper });

    result.current.mutate({ target: { kind: 'variant', variantId: '11' }, quantity: 2 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateCartItemDto).toHaveBeenCalledWith(11, 2, undefined);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });
});

describe('useRemoveCartItemMutation — hediye satırı', () => {
  it('removes only the gift row so the paid row of the same variant stays', async () => {
    useCartStore.setState({ items: [makeLine('901'), makeLine('902', { isGift: true, unitPrice: 0 })] });

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate({ kind: 'variant', variantId: '555', cartItemId: '902' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeCartItemDto).toHaveBeenCalledWith(555, 902);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].cartItemId).toBe('901');
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});

describe('useAddCartGiftMutation', () => {
  const GIFT = {
    productId: '77',
    campaignId: '12',
    name: 'Çorap',
    imageUrl: '',
    quantity: 2,
    sizes: [{ variantId: '3001', name: 'Standart', availableQuantity: 4, canAdd: true }],
  };

  it('posts the chosen size with the campaign and refreshes the cart', async () => {
    const { queryClient, clientWrapper } = createClientWrapper();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAddCartGiftMutation(), { wrapper: clientWrapper });

    result.current.mutate({ gift: GIFT, variantId: '3001' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addCartGiftDto).toHaveBeenCalledWith({
      campaignId: 12,
      productId: 77,
      variantId: 3001,
      quantity: 2,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: cartKeys.all });
    // Hediye eklemesi web'deki gibi add-to-cart olarak raporlanmaz.
    expect(trackerMock.trackAddToCart).not.toHaveBeenCalled();
  });

  it('refreshes the cart after a failure too, since stock or the campaign right may have changed', async () => {
    addCartGiftDto.mockRejectedValueOnce(new Error('stok yok'));
    const { queryClient, clientWrapper } = createClientWrapper();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAddCartGiftMutation(), { wrapper: clientWrapper });

    result.current.mutate({ gift: GIFT, variantId: '3001' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: cartKeys.all });
  });
});

describe('useCartCampaignBannerQuery', () => {
  it('asks for the campaigns of the listed category and keys the cache by it', async () => {
    const { queryClient, clientWrapper } = createClientWrapper();

    const { result } = renderHook(() => useCartCampaignBannerQuery(48), { wrapper: clientWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCartCampaignsDto).toHaveBeenCalledWith(48);
    expect(queryClient.getQueryState(cartKeys.campaigns(48))).toBeDefined();
    expect(queryClient.getQueryState(cartKeys.campaigns())).toBeUndefined();
  });
});
