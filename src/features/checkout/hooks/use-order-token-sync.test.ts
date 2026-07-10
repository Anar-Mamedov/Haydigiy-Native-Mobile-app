import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useOrderTokenSync, OrderTokenSyncInput } from './use-order-token-sync';
import * as checkoutService from '@/services/checkout.service';

jest.mock('@/services/checkout.service', () => ({
  updateOrderTokenDto: jest.fn(async () => ({ total_price: '100.00' })),
}));

const updateOrderTokenDto = checkoutService.updateOrderTokenDto as jest.MockedFunction<
  typeof checkoutService.updateOrderTokenDto
>;

function makeInput(overrides: Partial<OrderTokenSyncInput> = {}): OrderTokenSyncInput {
  return {
    orderToken: 'token-1',
    selectedCargo: { id: 2, name: 'Kargo', logo: '', price: 99.99, sortOrder: 0 },
    selectedMethod: {
      id: 7,
      name: 'Kredi Kartı',
      slug: 'credit_card',
      commissionRate: 0,
      serviceFee: 0,
      sortOrder: 0,
      description: null,
      maxOrderTotal: null,
    },
    shippingAddress: { id: 11 } as OrderTokenSyncInput['shippingAddress'],
    billingAddressId: 11,
    finalTotal: 100,
    installmentCount: 1,
    appliedCoupon: null,
    onCouponError: jest.fn(),
    onCouponRefresh: jest.fn(),
    onSyncError: jest.fn(),
    ...overrides,
  };
}

function renderOrderTokenSync(initialProps: OrderTokenSyncInput) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { gcTime: Infinity, retry: false } },
  });

  return renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
    initialProps,
    wrapper: ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  });
}

describe('useOrderTokenSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateOrderTokenDto.mockResolvedValue({ total_price: '100.00' });
  });

  // Regression: web'de ödeme sayfasına girilip çıkıldıktan sonra mobil checkout,
  // taslak siparişi kendi durumuna göre yeniden yazmadığı için submit'teki tutar
  // koruması sürekli "Sipariş tutarı güncellendi" hatası veriyordu.
  it('writes the draft order as soon as the screen state is ready (web parity)', async () => {
    renderOrderTokenSync(makeInput());

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    expect(updateOrderTokenDto.mock.calls[0]?.[0]).toEqual({
      order_token: 'token-1',
      cargo_id: 2,
      payment_method_id: 7,
      total_price: '100.00',
      installment_count: 1,
      coupon_code: undefined,
      shipping_address_id: 11,
      billing_address_id: 11,
    });
  });

  it('dedups identical states and re-syncs only when a selection changes', async () => {
    const { rerender } = renderOrderTokenSync(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(
      makeInput({
        selectedCargo: { id: 5, name: 'Diğer Kargo', logo: '', price: 49.99, sortOrder: 1 },
      }),
    );
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(2));
    expect(updateOrderTokenDto.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ cargo_id: 5 }),
    );
  });

  it('reuses the completed background sync when submit requests the same snapshot', async () => {
    const { result } = renderOrderTokenSync(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.syncNow();
    });

    expect(updateOrderTokenDto).toHaveBeenCalledTimes(1);
  });

  it('serializes changed snapshots so an older request cannot overwrite the latest state', async () => {
    let resolveFirst: ((value: { total_price: string; coupon?: {
      code: string;
      discount_type: 'fixed';
      discount: number;
      is_free_shipping: boolean;
    } }) => void) | undefined;
    updateOrderTokenDto
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ total_price: '200.00' });

    const onCouponRefresh = jest.fn();
    const { rerender } = renderOrderTokenSync(makeInput({ onCouponRefresh }));
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(makeInput({ finalTotal: 200, onCouponRefresh }));

    // The newer write is queued behind the in-flight old snapshot.
    await act(async () => {
      await Promise.resolve();
    });
    expect(updateOrderTokenDto).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst?.({
        total_price: '100.00',
        coupon: {
          code: 'ESKI',
          discount_type: 'fixed',
          discount: 10,
          is_free_shipping: false,
        },
      });
    });

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(2));
    expect(updateOrderTokenDto.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ total_price: '200.00' }),
    );
    expect(onCouponRefresh).not.toHaveBeenCalled();
  });

  // Regression: A → B → tekrar A geçişinde ilk A isteği hâlâ uçuştayken syncNow(A)
  // o isteği yeniden kullanırsa, arkasına kuyruklanmış B yazımı en son iner ve
  // taslak sipariş B'de kalırdı; İyzico initialize bu bayat satırdan hesap yapar.
  it('queues a fresh write when returning to a snapshot that has a different write scheduled after it', async () => {
    let resolveFirst: ((value: { total_price: string }) => void) | undefined;
    updateOrderTokenDto
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValue({ total_price: '100.00' });

    const { result, rerender } = renderOrderTokenSync(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    // State moves to B (queued behind the in-flight A write), then back to A.
    rerender(makeInput({ finalTotal: 200 }));
    rerender(makeInput());

    let submitResult: { total_price?: string | number } | null = null;
    await act(async () => {
      const submitPromise = result.current.syncNow().then((response) => {
        submitResult = response;
      });
      resolveFirst?.({ total_price: '100.00' });
      await submitPromise;
    });

    // A(1st) → B → A(re-write): the last landed write matches the screen state.
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(3));
    expect(updateOrderTokenDto.mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({ total_price: '100.00' }),
    );
    expect(submitResult).toEqual(expect.objectContaining({ total_price: '100.00' }));
  });

  it('does not fire until the order token, cargo and method are all present', async () => {
    const { rerender } = renderOrderTokenSync(makeInput({ orderToken: null }));

    await waitFor(() => expect(updateOrderTokenDto).not.toHaveBeenCalled());

    rerender(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
  });

  it('surfaces a backend coupon error through the callback', async () => {
    updateOrderTokenDto.mockResolvedValue({ coupon_error: 'Kupon geçersiz.' });
    const onCouponError = jest.fn();

    renderOrderTokenSync(
      makeInput({
        appliedCoupon: {
          code: 'KUPON10',
          discountType: 'fixed',
          discountValue: 10,
          discount: 10,
          isFreeShipping: false,
        },
        onCouponError,
      }),
    );

    await waitFor(() => expect(onCouponError).toHaveBeenCalledWith('Kupon geçersiz.'));
  });

  it('stays silent after the order is submitted (isPaused)', async () => {
    renderOrderTokenSync(makeInput({ isPaused: () => true }));

    await waitFor(() => expect(updateOrderTokenDto).not.toHaveBeenCalled());
  });

  it('ignores 422 responses silently like the web sync effect', async () => {
    updateOrderTokenDto.mockRejectedValue({ response: { status: 422 } });
    const onSyncError = jest.fn();

    renderOrderTokenSync(makeInput({ onSyncError }));

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    expect(onSyncError).not.toHaveBeenCalled();
  });
});
