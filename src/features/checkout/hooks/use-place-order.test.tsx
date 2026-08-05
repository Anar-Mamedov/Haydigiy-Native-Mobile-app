import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePlaceOrder } from './use-place-order';
import type { CheckoutController } from './use-checkout-controller';
import {
  clearPurchaseSnapshot,
  consumePurchaseSnapshot,
} from '../utils/purchase-snapshot';
import * as checkoutService from '@/services/checkout.service';
import type { OrderTokenResponseDto } from '@/services/checkout.service';
import type { OrderTokenSummary } from '@/types/checkout.types';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  }),
}));

jest.mock('@/services/checkout.service', () => ({
  confirmOrderDto: jest.fn(async () => ({
    message: 'ok',
    order_token: 'sec-1',
  })),
  getClientIp: jest.fn(async () => '127.0.0.1'),
  initializeIyzico3dsDto: jest.fn(async () => ({
    threeDSHtmlContent: '<html>3ds</html>',
  })),
  routePaymentDto: jest.fn(async () => ({
    status: 'error',
    message: 'kullanılmıyor',
  })),
}));

const initializeIyzico3dsDto = checkoutService.initializeIyzico3dsDto as jest.MockedFunction<
  typeof checkoutService.initializeIyzico3dsDto
>;
const confirmOrderDto = checkoutService.confirmOrderDto as jest.MockedFunction<
  typeof checkoutService.confirmOrderDto
>;
const routePaymentDto = checkoutService.routePaymentDto as jest.MockedFunction<
  typeof checkoutService.routePaymentDto
>;

function tokenResponse(totalPrice: string): OrderTokenResponseDto {
  return {
    subtotal: '2800.00',
    user_discount_amount: '0.00',
    campaign_discount_amount: '0.00',
    coupon_price: '0.00',
    cargo_price: '109.92',
    cod_price: '0.00',
    payment_commission_rate: '0.00',
    payment_fee: '0.00',
    installment_count: 1,
    interest_amount: '0.00',
    calculated_total_price: '9999.99',
    total_price: totalPrice,
  };
}

function orderSummary(totalPrice: number): OrderTokenSummary {
  return {
    subtotal: 2800,
    userDiscount: 0,
    campaignDiscount: 0,
    couponDiscount: 0,
    cargoPrice: 109.92,
    serviceFee: 0,
    commissionRate: 0,
    commission: 0,
    installmentCount: 1,
    installmentFee: 0,
    totalPrice,
    isFreeShippingCoupon: false,
  };
}

const card = {
  isValid: true,
  isRestrictedBin: false,
  digits: '5555444433332222',
  values: {
    owner: 'Test User',
    expiryMonth: '4',
    expiryYear: '30',
    cvv: '123',
  },
  selectedPlan: null as { installment: number; perMonth: number } | null,
};

function makeController(overrides: Partial<CheckoutController> = {}): CheckoutController {
  return {
    orderToken: 'order-token-1',
    shippingAddress: { id: 11, email: 'test@example.com' },
    billingAddress: null,
    sendInvoiceToSameAddress: true,
    selectedCargo: { id: 2, name: 'Kargo', price: 99.99 },
    selectedMethod: { id: 7, slug: 'credit_card', name: 'Kredi Kartı' },
    isCardPayment: true,
    card: { ...card },
    totals: { finalTotal: 2909.92 },
    orderSummary: orderSummary(2909.92),
    items: [{ title: 'Ürün', unitPrice: 1454.96, quantity: 2 }],
    appliedCoupon: null,
    syncOrderToken: jest.fn(async () => tokenResponse('2909.92')),
    refetchCart: jest.fn(async () => ({ isError: false })),
    setSubmitError: jest.fn(),
    markOrderSubmitted: jest.fn(),
    resumeOrderTokenSync: jest.fn(),
    ...overrides,
  } as unknown as CheckoutController;
}

function renderPlaceOrder(controller: CheckoutController) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderHook(() => usePlaceOrder(controller), {
    wrapper: ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  });
}

describe('usePlaceOrder order-token sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearPurchaseSnapshot();
  });

  it('stores the submitted cart lines for the Insider purchase event', async () => {
    const controller = makeController({
      isCardPayment: false,
      selectedMethod: { id: 3, slug: 'cash_on_delivery', name: 'Kapıda Ödeme' },
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(confirmOrderDto).toHaveBeenCalled());
    expect(consumePurchaseSnapshot()).toEqual(controller.items);
  });

  // Web parity: İyzico installment checkout relies on the on-change background
  // token sync and skips a second submit-time `/order/token` verification.
  it('skips submit-time /order/token verification before starting İyzico 3DS', async () => {
    const syncOrderToken = jest.fn(async () => tokenResponse('3009.91'));
    const controller = makeController({
      card: { ...card, selectedPlan: { installment: 3, perMonth: 970 } },
      orderSummary: orderSummary(2910),
      syncOrderToken,
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(initializeIyzico3dsDto).toHaveBeenCalled());
    expect(syncOrderToken).not.toHaveBeenCalled();
    expect(initializeIyzico3dsDto).toHaveBeenCalledWith(
      expect.objectContaining({ total_price: 2910 }),
    );
  });

  it('syncs /order/token before confirming a non-card (Kapıda Ödeme) order', async () => {
    const syncOrderToken = jest.fn(async () => tokenResponse('2909.92'));
    const controller = makeController({
      isCardPayment: false,
      selectedMethod: { id: 3, slug: 'cash_on_delivery', name: 'Kapıda Ödeme' },
      syncOrderToken,
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(confirmOrderDto).toHaveBeenCalled());
    expect(syncOrderToken).toHaveBeenCalledTimes(1);
    expect(syncOrderToken).toHaveBeenCalledWith({ forceNetwork: true });
    expect(syncOrderToken.mock.invocationCallOrder[0]).toBeLessThan(
      confirmOrderDto.mock.invocationCallOrder[0],
    );
    // Onaydan sonra token senkronu durur; sepet boşalınca işlenmiş siparişe
    // gereksiz /order/token atılmaz.
    expect(controller.markOrderSubmitted).toHaveBeenCalled();
  });

  it('forces a fresh /order/token check before routing single-card payment to 3DS', async () => {
    const syncOrderToken = jest.fn(async () => tokenResponse('2909.92'));
    const controller = makeController({ syncOrderToken });
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(routePaymentDto).toHaveBeenCalled());
    expect(syncOrderToken).toHaveBeenCalledWith({ forceNetwork: true });
    expect(syncOrderToken.mock.invocationCallOrder[0]).toBeLessThan(
      routePaymentDto.mock.invocationCallOrder[0],
    );
  });

  it('refreshes the cart and stops single-card 3DS when the backend total changes', async () => {
    const syncOrderToken = jest.fn(async () => tokenResponse('3009.91'));
    const controller = makeController({
      syncOrderToken,
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() =>
      expect(result.current.priceChangeConfirmation?.message).toContain(
        'Sipariş tutarı güncellendi: 3009.91',
      ),
    );
    expect(controller.refetchCart).toHaveBeenCalledTimes(1);
    expect(controller.setSubmitError).not.toHaveBeenCalledWith(
      expect.stringContaining('Sipariş tutarı güncellendi'),
    );
    expect(syncOrderToken).toHaveBeenCalledWith({ forceNetwork: true });
    expect(routePaymentDto).not.toHaveBeenCalled();
    expect(initializeIyzico3dsDto).not.toHaveBeenCalled();
    expect(confirmOrderDto).not.toHaveBeenCalled();
  });

  it('continues single-card payment after modal confirmation with the refreshed total', async () => {
    const syncOrderToken = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse('3009.91'))
      .mockResolvedValueOnce(tokenResponse('3009.91'));
    const controller = makeController({ syncOrderToken });
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(result.current.priceChangeConfirmation).not.toBeNull());
    await waitFor(() => expect(result.current.isSubmitting).toBe(false));

    // The successful cart refresh hydrates the controller with the amount the
    // user now sees before the explicit second press.
    controller.orderSummary = orderSummary(3009.91);

    act(() => {
      result.current.confirmPriceChange();
    });

    await waitFor(() => expect(routePaymentDto).toHaveBeenCalledTimes(1));
    expect(routePaymentDto).toHaveBeenCalledWith(expect.objectContaining({ total_price: 3009.91 }));
    expect(syncOrderToken).toHaveBeenCalledTimes(2);
  });

  it('reopens the modal instead of paying if the price changes again before confirmation', async () => {
    const syncOrderToken = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse('3009.91'))
      .mockResolvedValueOnce(tokenResponse('3109.91'));
    const controller = makeController({ syncOrderToken });
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(result.current.priceChangeConfirmation).not.toBeNull());
    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    controller.orderSummary = orderSummary(3009.91);

    act(() => {
      result.current.confirmPriceChange();
    });

    await waitFor(() =>
      expect(result.current.priceChangeConfirmation?.message).toContain('3109.91'),
    );
    expect(controller.refetchCart).toHaveBeenCalledTimes(2);
    expect(routePaymentDto).not.toHaveBeenCalled();
    expect(initializeIyzico3dsDto).not.toHaveBeenCalled();
    expect(confirmOrderDto).not.toHaveBeenCalled();
  });

  it('cancels the price-change modal without starting payment', async () => {
    const syncOrderToken = jest.fn(async () => tokenResponse('3009.91'));
    const controller = makeController({ syncOrderToken });
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(result.current.priceChangeConfirmation).not.toBeNull());

    act(() => {
      result.current.cancelPriceChange();
    });

    expect(result.current.priceChangeConfirmation).toBeNull();
    expect(routePaymentDto).not.toHaveBeenCalled();
    expect(initializeIyzico3dsDto).not.toHaveBeenCalled();
    expect(confirmOrderDto).not.toHaveBeenCalled();
  });

  it('refreshes the cart and waits for a fresh draft sync on an installment retry', async () => {
    initializeIyzico3dsDto.mockRejectedValueOnce(
      new Error('Geçersiz ödeme tutarı. Taksitli tutar ürün bedelinden düşük olamaz.'),
    );
    const controller = makeController({
      card: { ...card, selectedPlan: { installment: 3, perMonth: 970 } },
      orderSummary: orderSummary(2910),
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() =>
      expect(result.current.priceChangeConfirmation?.message).toBe(
        'Geçersiz ödeme tutarı. Taksitli tutar ürün bedelinden düşük olamaz.',
      ),
    );
    expect(controller.refetchCart).toHaveBeenCalledTimes(1);
    expect(result.current.threeDS).toBeNull();

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
    controller.orderSummary = orderSummary(3200.01);
    controller.card = {
      ...controller.card,
      selectedPlan: { installment: 3, perMonth: 1066.67 },
    } as CheckoutController['card'];
    const retrySyncOrderToken = controller.syncOrderToken as jest.Mock;
    retrySyncOrderToken.mockResolvedValueOnce(tokenResponse('3200.01'));

    act(() => {
      result.current.confirmPriceChange();
    });

    await waitFor(() => expect(initializeIyzico3dsDto).toHaveBeenCalledTimes(2));
    expect(retrySyncOrderToken).toHaveBeenCalledWith({ forceNetwork: true });
    expect(retrySyncOrderToken.mock.invocationCallOrder[0]).toBeLessThan(
      initializeIyzico3dsDto.mock.invocationCallOrder[1],
    );
    await waitFor(() =>
      expect(result.current.threeDS).toEqual(expect.objectContaining({ kind: 'iyzico-html' })),
    );
  });
});
