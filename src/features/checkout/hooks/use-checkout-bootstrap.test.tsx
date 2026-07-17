import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCheckoutBootstrap } from './use-checkout-bootstrap';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { useCartQuery } from '@/features/cart/api/cart.queries';
import { prepareOrderDto } from '@/services/order.service';

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartQuery: jest.fn(),
}));

jest.mock('@/services/order.service', () => ({
  extractInitialCargoId: (response: { order?: { cargo_id?: number } } | null) =>
    response?.order?.cargo_id ?? null,
  extractOrderToken: (response: { order_token?: string } | null) => response?.order_token ?? null,
  prepareOrderDto: jest.fn(),
}));

const mockedUseCartQuery = useCartQuery as jest.MockedFunction<typeof useCartQuery>;
const mockedPrepareOrderDto = prepareOrderDto as jest.MockedFunction<typeof prepareOrderDto>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderBootstrap(queryClient = createTestQueryClient()) {
  const hook = renderHook(() => useCheckoutBootstrap('fallback-token'), {
    wrapper: ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  });

  return { ...hook, queryClient };
}

describe('useCheckoutBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('waits for order preparation before making the cart snapshot checkout-authoritative', async () => {
    const preparation = deferred<Awaited<ReturnType<typeof prepareOrderDto>>>();
    const cartRefresh = deferred<{ isError: boolean }>();
    const refetch = jest.fn(() => cartRefresh.promise);

    mockedPrepareOrderDto.mockReturnValue(preparation.promise);
    mockedUseCartQuery.mockReturnValue({
      data: { campaigns: [], items: [], removedMessage: null, userDiscount: 0 },
      isError: false,
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useCartQuery>);

    const { queryClient, result, unmount } = renderBootstrap();

    expect(result.current.isLoading).toBe(true);
    expect(refetch).not.toHaveBeenCalled();

    await act(async () => {
      preparation.resolve({
        order_token: 'prepared-token',
        order: { cargo_id: 7 },
      });
      await preparation.promise;
    });

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      cartRefresh.resolve({ isError: false });
      await cartRefresh.promise;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orderToken).toBe('prepared-token');
    expect(result.current.initialCargoId).toBe(7);

    unmount();
    queryClient.clear();
  });

  it('waits out an older cart request and then starts a post-prepare refresh', async () => {
    const queryClient = createTestQueryClient();
    const preparation = deferred<Awaited<ReturnType<typeof prepareOrderDto>>>();
    const olderCartRequest = deferred<{ isError: boolean }>();
    const preparedCartRefresh = deferred<{ isError: boolean }>();
    const refetch = jest
      .fn()
      .mockReturnValueOnce(olderCartRequest.promise)
      .mockReturnValueOnce(preparedCartRefresh.promise);
    const olderQuery = queryClient.fetchQuery({
      queryKey: cartKeys.list(),
      queryFn: () => olderCartRequest.promise,
    });

    mockedPrepareOrderDto.mockReturnValue(preparation.promise);
    mockedUseCartQuery.mockReturnValue({
      data: { campaigns: [], items: [], removedMessage: null, userDiscount: 0 },
      isError: false,
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useCartQuery>);

    const { result, unmount } = renderBootstrap(queryClient);

    await act(async () => {
      preparation.resolve({ order_token: 'prepared-token', order: { cargo_id: 7 } });
      await preparation.promise;
    });

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(refetch).toHaveBeenNthCalledWith(1, { cancelRefetch: false });

    await act(async () => {
      olderCartRequest.resolve({ isError: false });
      await olderQuery;
    });

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      preparedCartRefresh.resolve({ isError: false });
      await preparedCartRefresh.promise;
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();
    queryClient.clear();
  });
});
