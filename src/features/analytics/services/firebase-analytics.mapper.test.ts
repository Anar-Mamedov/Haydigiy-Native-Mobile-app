import {
  GA4_MAX_PARAM_VALUE_LENGTH,
  toFirebaseAnalyticsCommand,
  toGa4Item,
} from './firebase-analytics.mapper';
import { AnalyticsEvent, AnalyticsProduct } from '../types/analytics.types';

const product: AnalyticsProduct = {
  brand: 'HaydiGiy',
  category: 'Tişört',
  categoryId: 7,
  currency: 'TRY',
  id: '101',
  name: 'Basic Tişört',
  price: 199.9,
  quantity: 2,
  variantId: '555',
};

describe('toGa4Item', () => {
  it('maps a product to the GA4 item shape', () => {
    expect(toGa4Item(product)).toEqual({
      item_brand: 'HaydiGiy',
      item_category: 'Tişört',
      item_id: '101',
      item_name: 'Basic Tişört',
      item_variant: '555',
      price: 199.9,
      quantity: 2,
    });
  });

  it('defaults the quantity to one and omits missing optional fields', () => {
    expect(toGa4Item({ currency: 'TRY', id: '7', name: 'Etek', price: 50 })).toEqual({
      item_id: '7',
      item_name: 'Etek',
      price: 50,
      quantity: 1,
    });
  });

  it('clips values to the GA4 parameter length limit', () => {
    const item = toGa4Item({ ...product, name: 'x'.repeat(150) });

    expect(String(item.item_name)).toHaveLength(GA4_MAX_PARAM_VALUE_LENGTH);
  });
});

describe('toFirebaseAnalyticsCommand', () => {
  it('reports screens by their route pattern, not the concrete path', () => {
    expect(
      toFirebaseAnalyticsCommand({
        name: 'screen_viewed',
        route: '/product/[id]',
        screen: '/product/123',
      }),
    ).toEqual({ kind: 'screen_view', screenClass: '/product/[id]', screenName: '/product/[id]' });
  });

  it('falls back to the path when no route pattern is known', () => {
    expect(toFirebaseAnalyticsCommand({ name: 'screen_viewed', screen: '/cart' })).toEqual({
      kind: 'screen_view',
      screenClass: '/cart',
      screenName: '/cart',
    });
  });

  it.each([
    ['product_viewed', 'view_item'],
    ['add_to_cart', 'add_to_cart'],
    ['remove_from_cart', 'remove_from_cart'],
    ['add_to_wishlist', 'add_to_wishlist'],
  ] as const)('maps %s to %s with value = price × quantity', (name, ga4Name) => {
    expect(toFirebaseAnalyticsCommand({ name, product } as AnalyticsEvent)).toEqual({
      kind: 'event',
      name: ga4Name,
      params: { currency: 'TRY', items: [toGa4Item(product)], value: 399.8 },
    });
  });

  it('maps a category view to view_item_list', () => {
    expect(
      toFirebaseAnalyticsCommand({ categoryId: 7, categoryName: 'Tişört', name: 'category_viewed' }),
    ).toEqual({
      kind: 'event',
      name: 'view_item_list',
      params: { item_list_id: '7', item_list_name: 'Tişört' },
    });
  });

  it('maps a search to the GA4 search event', () => {
    expect(toFirebaseAnalyticsCommand({ name: 'search_performed', query: 'elbise' })).toEqual({
      kind: 'event',
      name: 'search',
      params: { search_term: 'elbise' },
    });
  });

  it('maps checkout start to begin_checkout with the order total', () => {
    expect(
      toFirebaseAnalyticsCommand({
        currency: 'TRY',
        name: 'checkout_started',
        products: [product],
        revenue: 450.456,
      }),
    ).toEqual({
      kind: 'event',
      name: 'begin_checkout',
      params: { currency: 'TRY', items: [toGa4Item(product)], value: 450.46 },
    });
  });

  it('maps a purchase with the order number as transaction_id', () => {
    expect(
      toFirebaseAnalyticsCommand({
        currency: 'TRY',
        name: 'purchase_completed',
        orderId: 'HG-1001',
        products: [product],
        revenue: 399.8,
      }),
    ).toEqual({
      kind: 'event',
      name: 'purchase',
      params: {
        currency: 'TRY',
        items: [toGa4Item(product)],
        transaction_id: 'HG-1001',
        value: 399.8,
      },
    });
  });

  it('maps sign-up and login, keeping the login method when known', () => {
    expect(toFirebaseAnalyticsCommand({ name: 'user_signed_up' })).toEqual({
      kind: 'event',
      name: 'sign_up',
      params: {},
    });
    expect(toFirebaseAnalyticsCommand({ method: 'sms', name: 'user_logged_in' })).toEqual({
      kind: 'event',
      name: 'login',
      params: { method: 'sms' },
    });
  });

  /**
   * Backend MP ile de yalnızca yukarıdaki seti GA4'e iletiyor; bu event'ler
   * GA4'e hiçbir yoldan gitmiyordu ve gitmemeye devam etmeli.
   */
  it.each<AnalyticsEvent>([
    { filters: { color: 'red' }, name: 'filter_applied' },
    { itemCount: 3, name: 'cart_cleared' },
    { name: 'remove_from_wishlist', productId: '101' },
    { name: 'payment_result', status: 'failed' },
    { name: 'user_logged_out' },
  ])('does not send $name to GA4', (event) => {
    expect(toFirebaseAnalyticsCommand(event)).toBeNull();
  });
});
