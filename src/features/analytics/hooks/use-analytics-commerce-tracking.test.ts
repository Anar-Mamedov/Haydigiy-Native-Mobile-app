import { renderHook } from '@testing-library/react-native';
import {
  useTrackAnalyticsCategoryView,
  useTrackAnalyticsCheckoutStarted,
  useTrackAnalyticsPaymentResult,
  useTrackAnalyticsProductView,
  useTrackAnalyticsSearch,
} from './use-analytics-commerce-tracking';
import { AnalyticsEvent } from '../types/analytics.types';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

const mockTrack = jest.fn();

jest.mock('../services/analytics-dispatcher', () => ({
  analytics: { track: (event: AnalyticsEvent) => mockTrack(event) },
}));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    brand: 'HaydiGiy',
    category: 'Giyim',
    currency: 'TRY',
    description: '',
    id: '101',
    imageUrl: '',
    price: 199.9,
    rating: 0,
    reviewCount: 0,
    sellerName: 'HaydiGiy',
    shippingLabel: '',
    slug: 'tisort',
    title: 'Basic Tişört',
    ...overrides,
  } as Product;
}

function buildCartLine(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    imageUrl: '',
    productId: '101',
    quantity: 2,
    sellerName: 'HaydiGiy',
    title: 'Basic Tişört',
    unitPrice: 100,
    ...overrides,
  };
}

beforeEach(() => {
  mockTrack.mockClear();
});

describe('useTrackAnalyticsProductView', () => {
  it('waits for the product to load', () => {
    renderHook(() => useTrackAnalyticsProductView(null));

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('reports the view once the product resolves', () => {
    renderHook(() => useTrackAnalyticsProductView(buildProduct()));

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack.mock.calls[0][0]).toMatchObject({
      name: 'product_viewed',
      product: { id: '101', price: 199.9 },
    });
  });

  it('does not report the same product twice on re-render', () => {
    const product = buildProduct();
    const { rerender } = renderHook(
      ({ value }: { value: Product }) => useTrackAnalyticsProductView(value),
      { initialProps: { value: product } },
    );

    rerender({ value: { ...product } });

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it('reports again when the user navigates to a different product', () => {
    const { rerender } = renderHook(
      ({ value }: { value: Product }) => useTrackAnalyticsProductView(value),
      { initialProps: { value: buildProduct() } },
    );

    rerender({ value: buildProduct({ id: '202' }) });

    expect(mockTrack).toHaveBeenCalledTimes(2);
  });
});

describe('useTrackAnalyticsCategoryView', () => {
  it('waits until the category id is known', () => {
    renderHook(() => useTrackAnalyticsCategoryView(null));

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('reports the category with its name', () => {
    renderHook(() => useTrackAnalyticsCategoryView(7, 'Tişört'));

    expect(mockTrack).toHaveBeenCalledWith({
      categoryId: 7,
      categoryName: 'Tişört',
      name: 'category_viewed',
    });
  });

  it('does not report the same category twice when only the name arrives late', () => {
    const { rerender } = renderHook(
      ({ id, name }: { id: number; name?: string }) => useTrackAnalyticsCategoryView(id, name),
      { initialProps: { id: 7, name: undefined as string | undefined } },
    );

    rerender({ id: 7, name: 'Tişört' });

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it('reports again for a different category', () => {
    const { rerender } = renderHook(
      ({ id }: { id: number }) => useTrackAnalyticsCategoryView(id),
      { initialProps: { id: 7 } },
    );

    rerender({ id: 8 });

    expect(mockTrack).toHaveBeenCalledTimes(2);
  });
});

describe('useTrackAnalyticsSearch', () => {
  it('waits for the results before reporting, so result_count is meaningful', () => {
    renderHook(() => useTrackAnalyticsSearch('tişört', undefined, false));

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('ignores an empty query', () => {
    renderHook(() => useTrackAnalyticsSearch('   ', 0, true));

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('reports the trimmed query with its result count', () => {
    renderHook(() => useTrackAnalyticsSearch('  tişört ', 42, true));

    expect(mockTrack).toHaveBeenCalledWith({
      name: 'search_performed',
      query: 'tişört',
      resultCount: 42,
    });
  });

  it('reports a zero-result search, which is the one worth acting on', () => {
    renderHook(() => useTrackAnalyticsSearch('xyzzy', 0, true));

    expect(mockTrack.mock.calls[0][0]).toMatchObject({ resultCount: 0 });
  });

  it('does not report the same query twice when the count changes on refetch', () => {
    const { rerender } = renderHook(
      ({ count }: { count: number }) => useTrackAnalyticsSearch('tişört', count, true),
      { initialProps: { count: 42 } },
    );

    rerender({ count: 40 });

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it('reports a new query', () => {
    const { rerender } = renderHook(
      ({ query }: { query: string }) => useTrackAnalyticsSearch(query, 10, true),
      { initialProps: { query: 'tişört' } },
    );

    rerender({ query: 'pantolon' });

    expect(mockTrack).toHaveBeenCalledTimes(2);
  });
});

describe('useTrackAnalyticsCheckoutStarted', () => {
  it('waits for the cart lines to arrive', () => {
    renderHook(() => useTrackAnalyticsCheckoutStarted([]));

    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('reports the line total as revenue, matching the web begin_checkout basis', () => {
    renderHook(() =>
      useTrackAnalyticsCheckoutStarted([
        buildCartLine({ quantity: 2, unitPrice: 100 }),
        buildCartLine({ productId: '102', quantity: 1, unitPrice: 50 }),
      ]),
    );

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack.mock.calls[0][0]).toMatchObject({
      currency: 'TRY',
      name: 'checkout_started',
      revenue: 250,
    });
  });

  it('reports once even though the cart lines arrive after mount', () => {
    const { rerender } = renderHook(
      ({ items }: { items: CartLineItem[] }) => useTrackAnalyticsCheckoutStarted(items),
      { initialProps: { items: [] as CartLineItem[] } },
    );

    rerender({ items: [buildCartLine()] });
    rerender({ items: [buildCartLine(), buildCartLine({ productId: '102' })] });

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });
});

describe('useTrackAnalyticsPaymentResult', () => {
  it('reports a failed payment with the order number', () => {
    renderHook(() => useTrackAnalyticsPaymentResult('failed', '5001'));

    expect(mockTrack).toHaveBeenCalledWith({
      name: 'payment_result',
      orderId: '5001',
      status: 'failed',
    });
  });

  it('reports a bank-pending payment as pending, not as failed', () => {
    renderHook(() => useTrackAnalyticsPaymentResult('pending', '5001'));

    expect(mockTrack.mock.calls[0][0]).toMatchObject({ status: 'pending' });
  });

  it('omits an empty order number rather than sending a blank string', () => {
    renderHook(() => useTrackAnalyticsPaymentResult('failed', ''));

    expect(mockTrack.mock.calls[0][0]).toMatchObject({ orderId: undefined });
  });

  it('reports only once per screen', () => {
    const { rerender } = renderHook(() => useTrackAnalyticsPaymentResult('failed', '5001'));

    rerender({});

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });
});
