import { createElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as orderService from '@/services/order.service';
import { orderKeys } from './order.keys';
import { useSubmitOrderCancelMutation } from './order-cancel.mutations';

jest.mock('@/services/order.service', () => ({
  ...jest.requireActual('@/services/order.service'),
  submitOrderCancelDto: jest.fn(),
}));

const submitOrderCancelDto = orderService.submitOrderCancelDto as jest.MockedFunction<
  typeof orderService.submitOrderCancelDto
>;

const ITEMS = [{ orderItemId: 9001, quantity: 1, cancellationReasonId: 5 }];

function axiosError(status: number, data: unknown) {
  return { isAxiosError: true, message: `Request failed with status code ${status}`, response: { data, status } };
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  const { result } = renderHook(() => useSubmitOrderCancelMutation(), { wrapper });
  return { invalidateQueries, result };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSubmitOrderCancelMutation', () => {
  it('refreshes the order detail and lists after a successful cancel', async () => {
    submitOrderCancelDto.mockResolvedValueOnce({ message: 'İptal talebiniz alındı.' });
    const { invalidateQueries, result } = setup();

    result.current.mutate({ id: '10', items: ITEMS });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: orderKeys.detail('10') });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: orderKeys.lists() });
  });

  // HMA-63: sipariş kontrole geçtiyse ("İptal işlemi kontrol ediliyor") sunucudaki durum değişti;
  // detay ekranı önbellekteki eski durumu göstermemeli.
  it('also refreshes them when the failed cancel moved the order under review', async () => {
    submitOrderCancelDto.mockRejectedValueOnce(
      axiosError(409, { message: 'İptal işleminiz kontrol gerektiriyor.', order_under_review: true }),
    );
    const { invalidateQueries, result } = setup();

    result.current.mutate({ id: '10', items: ITEMS });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: orderKeys.detail('10') });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: orderKeys.lists() });
  });

  it('leaves the cache alone on any other cancel error', async () => {
    submitOrderCancelDto.mockRejectedValueOnce(axiosError(422, { message: 'Bu sipariş iptal edilemez.' }));
    const { invalidateQueries, result } = setup();

    result.current.mutate({ id: '10', items: ITEMS });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
