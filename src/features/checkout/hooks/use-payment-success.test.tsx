import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { usePaymentSuccess } from './use-payment-success';
import { clearPurchaseSnapshot, setPurchaseSnapshot } from '../utils/purchase-snapshot';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { CartLineItem } from '@/types/cart.types';

const searchParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ ...searchParams }),
}));

jest.mock('@/services/checkout.service', () => ({
  getOrderByTokenDto: jest.fn(async () => ({
    id: 5,
    order_no: 'HG-1001',
    total_price: 2909.92,
  })),
  queryOrderDto: jest.fn(async () => undefined),
  submitGarantiCallbackDto: jest.fn(async () => undefined),
}));

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    trackPurchase: jest.fn(),
  },
}));

const trackerMock = insiderTracker as jest.Mocked<typeof insiderTracker>;

function makeItem(productId: string): CartLineItem {
  return {
    productId,
    title: `Ürün ${productId}`,
    imageUrl: '',
    sellerName: '',
    quantity: 2,
    unitPrice: 1454.96,
  };
}

function renderPaymentSuccess() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderHook(() => usePaymentSuccess(), {
    wrapper: ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  clearPurchaseSnapshot();
  useCartStore.setState({ items: [] });
  Object.keys(searchParams).forEach((key) => delete searchParams[key]);
  searchParams.secureToken = 'sec-1';
  searchParams.totalPrice = '2909.92';
});

describe('usePaymentSuccess Insider purchase event', () => {
  it('sends one purchase event per submitted line with the resolved order no', async () => {
    setPurchaseSnapshot([makeItem('42'), makeItem('43')]);

    const { result } = renderPaymentSuccess();

    await waitFor(() => expect(result.current.isProcessing).toBe(false));

    expect(trackerMock.trackPurchase).toHaveBeenCalledTimes(1);
    const [saleId, items] = trackerMock.trackPurchase.mock.calls[0];
    expect(saleId).toBe('HG-1001');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: '42', quantity: 2, price: 1454.96 });
  });

  it('falls back to the live cart lines when no snapshot exists', async () => {
    useCartStore.setState({ items: [makeItem('55')] });

    const { result } = renderPaymentSuccess();

    await waitFor(() => expect(result.current.isProcessing).toBe(false));

    expect(trackerMock.trackPurchase).toHaveBeenCalledTimes(1);
    expect(trackerMock.trackPurchase.mock.calls[0][1][0]).toMatchObject({ id: '55' });
  });

  it('skips the purchase event when there is nothing to report', async () => {
    const { result } = renderPaymentSuccess();

    await waitFor(() => expect(result.current.isProcessing).toBe(false));

    expect(trackerMock.trackPurchase).not.toHaveBeenCalled();
  });
});
