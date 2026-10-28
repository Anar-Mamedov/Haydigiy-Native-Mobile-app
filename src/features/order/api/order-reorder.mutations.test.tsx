import { createElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useReorderMutation } from './order-reorder.mutations';
import { cartKeys } from '@/features/cart/api/cart.keys';
import * as orderService from '@/services/order.service';

jest.mock('@/services/order.service', () => ({
  reorderOrderDto: jest.fn(),
}));

const reorderOrderDto = orderService.reorderOrderDto as jest.MockedFunction<
  typeof orderService.reorderOrderDto
>;

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const { result } = renderHook(() => useReorderMutation(), { wrapper });
  return { invalidateQueries, result };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReorderMutation', () => {
  it('maps the response and refreshes the cart once lines were added', async () => {
    reorderOrderDto.mockResolvedValueOnce({ added_to_cart: true, message: 'Eklendi.' });
    const { invalidateQueries, result } = setup();

    result.current.mutate({ orderId: '42', confirmed: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reorderOrderDto).toHaveBeenCalledWith('42', true);
    expect(result.current.data).toEqual(
      expect.objectContaining({ kind: 'added', message: 'Eklendi.' }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: cartKeys.all });
  });

  it('leaves the cart alone while the customer still has to confirm', async () => {
    reorderOrderDto.mockResolvedValueOnce({ requires_confirmation: true });
    const { invalidateQueries, result } = setup();

    result.current.mutate({ orderId: '42' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reorderOrderDto).toHaveBeenCalledWith('42', false);
    expect(result.current.data?.kind).toBe('needsConfirmation');
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  // İstek yarıda koptuysa sunucu ürünleri eklemiş olabilir; sepet yine tazelenir.
  it('refreshes the cart when the outcome is unknown', async () => {
    reorderOrderDto.mockRejectedValueOnce(new Error('timeout'));
    const { invalidateQueries, result } = setup();

    result.current.mutate({ orderId: '42' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: cartKeys.all });
  });
});
