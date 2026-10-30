import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { useOrderMergePayment } from './use-order-merge-payment';
import * as checkoutService from '@/services/checkout.service';
import type { CartLineItem } from '@/types/cart.types';
import type { OrderMergeCardSession } from '@/types/order-merge.types';

jest.mock('@/services/checkout.service', () => ({
  getClientIp: jest.fn(async () => '10.0.0.1'),
  routePaymentDto: jest.fn(),
}));

const mockItems: CartLineItem[] = [
  {
    imageUrl: 'https://example.com/p.jpg',
    productId: '100',
    quantity: 2,
    sellerName: 'Satıcı',
    title: 'Ürün',
    unitPrice: 125,
    variantId: '200',
  },
];

jest.mock('@/features/cart/store/use-cart-store', () => ({
  useCartStore: (selector: (state: { items: CartLineItem[] }) => unknown) =>
    selector({ items: mockItems }),
}));

jest.mock('@/features/checkout/utils/purchase-snapshot', () => ({
  setPurchaseSnapshot: jest.fn(),
}));

const routePaymentDto = checkoutService.routePaymentDto as jest.MockedFunction<
  typeof checkoutService.routePaymentDto
>;

const SESSION: OrderMergeCardSession = {
  orderToken: 'tok-1',
  parentOrderNo: 'HG100254',
  amount: 250,
  installmentCount: 3,
  cargoId: 4,
  paymentMethodId: 1,
};

function setup(session: OrderMergeCardSession = SESSION) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return renderHook(() => useOrderMergePayment(session), { wrapper });
}

function fillCard(result: ReturnType<typeof setup>['result']) {
  act(() => {
    result.current.card.setOwner('AYŞE YILMAZ');
    result.current.card.setNumber('4111111111111111');
    result.current.card.setExpiryMonth('12');
    result.current.card.setExpiryYear('30');
    result.current.card.setCvv('123');
  });
}

describe('useOrderMergePayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not charge before the card is complete', async () => {
    const { result } = setup();

    expect(result.current.canSubmit).toBe(false);
    await act(async () => {
      result.current.submit();
    });

    expect(routePaymentDto).not.toHaveBeenCalled();
    expect(result.current.submitError).toBe('Lütfen kart bilgilerini eksiksiz doldurun.');
  });

  it('charges the draft order with its cargo, method and the locked installments', async () => {
    routePaymentDto.mockResolvedValue({ status: 'success', threeDSHtmlContent: '<form>3ds</form>' });
    const { result } = setup();
    fillCard(result);

    await act(async () => {
      result.current.submit();
    });

    expect(routePaymentDto).toHaveBeenCalledWith(
      expect.objectContaining({
        order_token: 'tok-1',
        total_price: 250,
        installment_count: 3,
        cargo_id: 4,
        payment_method_id: 1,
        basket: [{ name: 'Ürün', price: 125, quantity: 2 }],
        card_number: '4111111111111111',
        customer_ip: '10.0.0.1',
      }),
    );
    expect(result.current.threeDS).toEqual({ kind: 'iyzico-html', html: '<form>3ds</form>' });
  });

  it('sends a single payment without an installment count', async () => {
    routePaymentDto.mockResolvedValue({ threeDSHtmlContent: '<form>3ds</form>' });
    const { result } = setup({ ...SESSION, installmentCount: 1 });
    fillCard(result);

    await act(async () => {
      result.current.submit();
    });

    expect(routePaymentDto).toHaveBeenCalledWith(expect.objectContaining({ installment_count: 0 }));
  });

  it('opens the Garanti 3D form for a Garanti answer', async () => {
    routePaymentDto.mockResolvedValue({
      gateway_url: 'https://garanti.example/3d',
      fields: { secure3dhash: 'HASH', customeripaddress: '1.2.3.4' },
    });
    const { result } = setup({ ...SESSION, installmentCount: 1 });
    fillCard(result);

    await act(async () => {
      result.current.submit();
    });

    const payload = result.current.threeDS;
    expect(payload?.kind).toBe('garanti-form');
    if (payload?.kind !== 'garanti-form') return;
    expect(payload.html).toContain('https://garanti.example/3d');
    expect(payload.html).toContain('1.2.3.4');
  });

  it('shows the router message and lets the customer retry', async () => {
    routePaymentDto.mockResolvedValue({ status: 'error', message: 'Günlük ödeme limiti aşıldı.' });
    const { result } = setup();
    fillCard(result);

    await act(async () => {
      result.current.submit();
    });

    expect(result.current.submitError).toBe('Günlük ödeme limiti aşıldı.');
    expect(result.current.threeDS).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('closes the 3DS page on cancel', async () => {
    routePaymentDto.mockResolvedValue({ threeDSHtmlContent: '<form>3ds</form>' });
    const { result } = setup();
    fillCard(result);
    await act(async () => {
      result.current.submit();
    });

    act(() => result.current.closeThreeDS());

    expect(result.current.threeDS).toBeNull();
  });
});
