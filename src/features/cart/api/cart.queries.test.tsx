import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useClearCartMutation } from './cart.queries';
import { useCartStore } from '../store/use-cart-store';
import { CartLineItem } from '@/types/cart.types';
import * as cartService from '@/services/cart.service';

jest.mock('@/services/cart.service', () => ({
  removeCartItemDto: jest.fn(async () => undefined),
  getCartDto: jest.fn(async () => ({ cart: [] })),
}));

const removeCartItemDto = cartService.removeCartItemDto as jest.MockedFunction<
  typeof cartService.removeCartItemDto
>;

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

describe('useClearCartMutation', () => {
  beforeEach(() => {
    removeCartItemDto.mockClear();
    removeCartItemDto.mockResolvedValue(undefined);
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
});
