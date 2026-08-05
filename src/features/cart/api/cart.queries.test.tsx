import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useAddToCartMutation,
  useClearCartMutation,
  useRemoveCartItemMutation,
} from './cart.queries';
import { useCartStore } from '../store/use-cart-store';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { CartLineItem } from '@/types/cart.types';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  addToCartDto: jest.fn(async () => undefined),
  removeCartItemDto: jest.fn(async () => undefined),
  getCartDto: jest.fn(async () => ({ cart: [] })),
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
});

describe('useClearCartMutation', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [makeItem('11'), makeItem('22'), makeItem('33')] });
  });

  it('removes every passed variant on the backend even though the store is cleared optimistically', async () => {
    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([11, 22, 33]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeCartItemDto).toHaveBeenCalledTimes(3);
    expect(removeCartItemDto).toHaveBeenCalledWith(11);
    expect(removeCartItemDto).toHaveBeenCalledWith(22);
    expect(removeCartItemDto).toHaveBeenCalledWith(33);
    // Optimistic clear leaves the store empty on success.
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('rolls back the optimistic clear when a removal fails', async () => {
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([11, 22, 33]);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useCartStore.getState().items).toHaveLength(3);
  });

  it('sends the Insider cart-cleared event only on success', async () => {
    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([11, 22, 33]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackCartCleared).toHaveBeenCalledTimes(1);
  });

  it('does not send the cart-cleared event when clearing fails', async () => {
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useClearCartMutation(), { wrapper });

    result.current.mutate([11, 22, 33]);
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

    result.current.mutate('11');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackRemoveFromCart).toHaveBeenCalledWith('11');
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });

  it('also sends cart-cleared when the last line is removed', async () => {
    useCartStore.setState({ items: [makeItem('11')] });

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate('11');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackRemoveFromCart).toHaveBeenCalledWith('11');
    expect(trackerMock.trackCartCleared).toHaveBeenCalledTimes(1);
  });

  it('does not send remove events when the removal fails', async () => {
    useCartStore.setState({ items: [makeItem('11')] });
    removeCartItemDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useRemoveCartItemMutation(), { wrapper });

    result.current.mutate('11');
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(trackerMock.trackRemoveFromCart).not.toHaveBeenCalled();
    expect(trackerMock.trackCartCleared).not.toHaveBeenCalled();
  });
});
