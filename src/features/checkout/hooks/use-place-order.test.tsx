import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePlaceOrder } from './use-place-order';
import type { CheckoutController } from './use-checkout-controller';
import * as checkoutService from '@/services/checkout.service';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  }),
}));

jest.mock('@/services/checkout.service', () => ({
  confirmOrderDto: jest.fn(async () => ({ message: 'ok', order_token: 'sec-1' })),
  getClientIp: jest.fn(async () => '127.0.0.1'),
  initializeIyzico3dsDto: jest.fn(async () => ({ threeDSHtmlContent: '<html>3ds</html>' })),
  routePaymentDto: jest.fn(async () => ({ status: 'error', message: 'kullanılmıyor' })),
  updateOrderTokenDto: jest.fn(async () => ({ total_price: '2909.92' })),
}));

const updateOrderTokenDto = checkoutService.updateOrderTokenDto as jest.MockedFunction<
  typeof checkoutService.updateOrderTokenDto
>;
const initializeIyzico3dsDto = checkoutService.initializeIyzico3dsDto as jest.MockedFunction<
  typeof checkoutService.initializeIyzico3dsDto
>;
const confirmOrderDto = checkoutService.confirmOrderDto as jest.MockedFunction<
  typeof checkoutService.confirmOrderDto
>;

const card = {
  isValid: true,
  isRestrictedBin: false,
  digits: '5555444433332222',
  values: { owner: 'Test User', expiryMonth: '4', expiryYear: '30', cvv: '123' },
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
    items: [{ title: 'Ürün', unitPrice: 1454.96, quantity: 2 }],
    appliedCoupon: null,
    setSubmitError: jest.fn(),
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
    updateOrderTokenDto.mockResolvedValue({ total_price: '2909.92' });
  });

  // Regression: İyzico `prepare` ve `/order/confirm` kargo bedava kampanyasını
  // yalnızca `/order/token` adımının sipariş satırına yazdığı snapshot'tan okur.
  // Bu senkron atlanınca kampanyaya rağmen kargo ücreti tahsil ediliyordu.
  it('syncs /order/token with the plan installment before starting İyzico 3DS', async () => {
    const controller = makeController({
      card: { ...card, selectedPlan: { installment: 3, perMonth: 970 } },
      totals: { finalTotal: 2910 },
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    updateOrderTokenDto.mockResolvedValue({ total_price: '2910.00' });

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(initializeIyzico3dsDto).toHaveBeenCalled());
    expect(updateOrderTokenDto).toHaveBeenCalledWith(
      expect.objectContaining({ installment_count: 3, cargo_id: 2, total_price: '2910.00' }),
    );
    expect(updateOrderTokenDto.mock.invocationCallOrder[0]).toBeLessThan(
      initializeIyzico3dsDto.mock.invocationCallOrder[0],
    );
  });

  it('syncs /order/token before confirming a non-card (Kapıda Ödeme) order', async () => {
    const controller = makeController({
      isCardPayment: false,
      selectedMethod: { id: 3, slug: 'cash_on_delivery', name: 'Kapıda Ödeme' },
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    act(() => {
      result.current.submit();
    });

    await waitFor(() => expect(confirmOrderDto).toHaveBeenCalled());
    expect(updateOrderTokenDto).toHaveBeenCalledWith(
      expect.objectContaining({ installment_count: 1, payment_method_id: 3 }),
    );
    expect(updateOrderTokenDto.mock.invocationCallOrder[0]).toBeLessThan(
      confirmOrderDto.mock.invocationCallOrder[0],
    );
  });

  it('stops before charging when the backend total no longer matches the shown total', async () => {
    const controller = makeController({
      card: { ...card, selectedPlan: { installment: 3, perMonth: 970 } },
    } as unknown as Partial<CheckoutController>);
    const { result } = renderPlaceOrder(controller);

    updateOrderTokenDto.mockResolvedValue({ total_price: '3009.91' });

    act(() => {
      result.current.submit();
    });

    await waitFor(() =>
      expect(controller.setSubmitError).toHaveBeenCalledWith(
        expect.stringContaining('Sipariş tutarı güncellendi: 3009.91'),
      ),
    );
    expect(initializeIyzico3dsDto).not.toHaveBeenCalled();
    expect(confirmOrderDto).not.toHaveBeenCalled();
  });
});
