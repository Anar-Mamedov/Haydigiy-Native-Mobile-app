import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useOrderTokenSync, OrderTokenSyncInput } from './use-order-token-sync';
import * as checkoutService from '@/services/checkout.service';
import type { OrderTokenResponseDto } from '@/services/checkout.service';

jest.mock('@/services/checkout.service', () => ({
  updateOrderTokenDto: jest.fn(),
}));

const updateOrderTokenDto = checkoutService.updateOrderTokenDto as jest.MockedFunction<
  typeof checkoutService.updateOrderTokenDto
>;

function tokenResponse(
  totalPrice: string,
  overrides: Partial<OrderTokenResponseDto> = {},
): OrderTokenResponseDto {
  return {
    subtotal: '80.00',
    user_discount_amount: '0.00',
    campaign_discount_amount: '0.00',
    coupon_price: '0.00',
    cargo_price: '20.00',
    cod_price: '0.00',
    payment_commission_rate: '0.00',
    payment_fee: '0.00',
    installment_count: 1,
    interest_amount: '0.00',
    calculated_total_price: '999.99',
    total_price: totalPrice,
    ...overrides,
  };
}

function makeInput(overrides: Partial<OrderTokenSyncInput> = {}): OrderTokenSyncInput {
  return {
    orderToken: 'token-1',
    selectedCargo: {
      id: 2,
      name: 'Kargo',
      logo: '',
      price: 99.99,
      sortOrder: 0,
    },
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
    requestTotal: 100,
    installmentCount: 1,
    appliedCoupon: null,
    onCouponError: jest.fn(),
    onCouponRefresh: jest.fn(),
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
    updateOrderTokenDto.mockResolvedValue(tokenResponse('100.00'));
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
        selectedCargo: {
          id: 5,
          name: 'Diğer Kargo',
          logo: '',
          price: 49.99,
          sortOrder: 1,
        },
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

  it('publishes a complete API summary and uses total_price for the visible total', async () => {
    updateOrderTokenDto.mockResolvedValueOnce(
      tokenResponse('499.97', {
        subtotal: '399.99',
        coupon_price: '40.00',
        cargo_price: '119.99',
        cod_price: '19.99',
        calculated_total_price: '777.77',
      }),
    );
    const { result } = renderOrderTokenSync(makeInput());

    await waitFor(() => expect(result.current.summary?.totalPrice).toBe(499.97));
    expect(result.current.summary).toEqual(
      expect.objectContaining({
        subtotal: 399.99,
        couponDiscount: 40,
        cargoPrice: 119.99,
        serviceFee: 19.99,
      }),
    );
    expect(result.current.errorMessage).toBeNull();
  });

  it('rejects an incomplete pricing response instead of calculating a fallback', async () => {
    updateOrderTokenDto.mockResolvedValueOnce(tokenResponse('100.00', { cargo_price: undefined }));
    const { result } = renderOrderTokenSync(makeInput());

    await waitFor(() => expect(result.current.errorMessage).toContain('cargo_price'));
    expect(result.current.summary).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('forces a fresh backend write for submit-time cross-device cart checks', async () => {
    const { result } = renderOrderTokenSync(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    updateOrderTokenDto.mockResolvedValueOnce(tokenResponse('600.00'));

    let response: OrderTokenResponseDto | null = null;
    await act(async () => {
      response = await result.current.syncNow({ forceNetwork: true });
    });

    expect(updateOrderTokenDto).toHaveBeenCalledTimes(2);
    expect(response).toEqual(expect.objectContaining({ total_price: '600.00' }));
  });

  it('serializes changed snapshots so an older request cannot overwrite the latest state', async () => {
    let resolveFirst: ((value: OrderTokenResponseDto) => void) | undefined;
    updateOrderTokenDto
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(tokenResponse('200.00'));

    const onCouponRefresh = jest.fn();
    const { rerender } = renderOrderTokenSync(makeInput({ onCouponRefresh }));
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(makeInput({ requestTotal: 200, onCouponRefresh }));

    // The newer write is queued behind the in-flight old snapshot.
    await act(async () => {
      await Promise.resolve();
    });
    expect(updateOrderTokenDto).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst?.(
        tokenResponse('100.00', {
          coupon: {
            code: 'ESKI',
            discount_type: 'fixed',
            discount: 10,
            is_free_shipping: false,
          },
        }),
      );
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
    let resolveFirst: ((value: OrderTokenResponseDto) => void) | undefined;
    updateOrderTokenDto
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValue(tokenResponse('100.00'));

    const { result, rerender } = renderOrderTokenSync(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    // State moves to B (queued behind the in-flight A write), then back to A.
    rerender(makeInput({ requestTotal: 200 }));
    rerender(makeInput());

    let submitResult: { total_price?: string | number } | null = null;
    await act(async () => {
      const submitPromise = result.current.syncNow().then((response) => {
        submitResult = response;
      });
      resolveFirst?.(tokenResponse('100.00'));
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
    updateOrderTokenDto.mockResolvedValue(
      tokenResponse('100.00', { coupon_error: 'Kupon geçersiz.' }),
    );
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

  it('exposes a sync error when the API cannot provide the authoritative summary', async () => {
    updateOrderTokenDto.mockRejectedValue({ response: { status: 422 } });
    const { result } = renderOrderTokenSync(makeInput());

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());
    expect(result.current.summary).toBeNull();
  });
});
