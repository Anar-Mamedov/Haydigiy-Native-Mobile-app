import { renderHook, waitFor } from '@testing-library/react-native';
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

describe('useOrderTokenSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateOrderTokenDto.mockResolvedValue({ total_price: '100.00' });
  });

  // Regression: web'de ödeme sayfasına girilip çıkıldıktan sonra mobil checkout,
  // taslak siparişi kendi durumuna göre yeniden yazmadığı için submit'teki tutar
  // koruması sürekli "Sipariş tutarı güncellendi" hatası veriyordu.
  it('writes the draft order as soon as the screen state is ready (web parity)', async () => {
    renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput(),
    });

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    expect(updateOrderTokenDto).toHaveBeenCalledWith({
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
    const { rerender } = renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput(),
    });
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));

    rerender(
      makeInput({
        selectedCargo: { id: 5, name: 'Diğer Kargo', logo: '', price: 49.99, sortOrder: 1 },
      }),
    );
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(2));
    expect(updateOrderTokenDto).toHaveBeenLastCalledWith(
      expect.objectContaining({ cargo_id: 5 }),
    );
  });

  it('does not fire until the order token, cargo and method are all present', async () => {
    const { rerender } = renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput({ orderToken: null }),
    });

    await waitFor(() => expect(updateOrderTokenDto).not.toHaveBeenCalled());

    rerender(makeInput());
    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
  });

  it('surfaces a backend coupon error through the callback', async () => {
    updateOrderTokenDto.mockResolvedValue({ coupon_error: 'Kupon geçersiz.' });
    const onCouponError = jest.fn();

    renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput({
        appliedCoupon: {
          code: 'KUPON10',
          discountType: 'fixed',
          discountValue: 10,
          discount: 10,
          isFreeShipping: false,
        },
        onCouponError,
      }),
    });

    await waitFor(() => expect(onCouponError).toHaveBeenCalledWith('Kupon geçersiz.'));
  });

  it('stays silent after the order is submitted (isPaused)', async () => {
    renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput({ isPaused: () => true }),
    });

    await waitFor(() => expect(updateOrderTokenDto).not.toHaveBeenCalled());
  });

  it('ignores 422 responses silently like the web sync effect', async () => {
    updateOrderTokenDto.mockRejectedValue({ response: { status: 422 } });
    const onSyncError = jest.fn();

    renderHook((props: OrderTokenSyncInput) => useOrderTokenSync(props), {
      initialProps: makeInput({ onSyncError }),
    });

    await waitFor(() => expect(updateOrderTokenDto).toHaveBeenCalledTimes(1));
    expect(onSyncError).not.toHaveBeenCalled();
  });
});
