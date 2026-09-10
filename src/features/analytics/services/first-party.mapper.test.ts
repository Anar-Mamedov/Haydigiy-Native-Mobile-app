import { AnalyticsContext } from './analytics-sink';
import { buildClientLabel, toFirstPartyEventDto, toIntOrNull } from './first-party.mapper';
import { AnalyticsProduct } from '../types/analytics.types';

function buildContext(overrides: Partial<AnalyticsContext> = {}): AnalyticsContext {
  return {
    anonymousId: 'anon-1',
    appVersion: '2.3.24',
    deviceId: 'device-1',
    deviceType: 'mobile',
    os: 'iOS',
    osVersion: '18.2',
    screenHeight: 844,
    screenPath: '/cart',
    screenWidth: 390,
    sessionId: 'sess-1',
    userId: 42,
    ...overrides,
  };
}

const product: AnalyticsProduct = {
  brand: 'HaydiGiy',
  category: 'Tişört',
  categoryId: 7,
  currency: 'TRY',
  id: '101',
  name: 'Basic Tişört',
  price: 199.9,
  quantity: 2,
  variantId: '9001',
};

describe('toIntOrNull', () => {
  it.each([
    ['101', 101],
    [101, 101],
    [101.7, 101],
  ])('coerces %p to %p for the integer column', (input, expected) => {
    expect(toIntOrNull(input)).toBe(expected);
  });

  it.each([undefined, null, '', 'HG-2024-ABC'])(
    'returns null for %p so the backend never rejects the batch',
    (input) => {
      expect(toIntOrNull(input)).toBeNull();
    },
  );
});

describe('buildClientLabel', () => {
  it('labels app traffic with the version so it is separable from browser traffic', () => {
    expect(buildClientLabel(buildContext())).toBe('HaydiGiy App 2.3.24');
  });

  it('still labels the client when the version is unavailable', () => {
    expect(buildClientLabel(buildContext({ appVersion: '' }))).toBe('HaydiGiy App');
  });
});

describe('toFirstPartyEventDto', () => {
  it('stamps every event with the shared context columns', () => {
    const dto = toFirstPartyEventDto({ name: 'user_signed_up' }, buildContext());

    expect(dto).toMatchObject({
      anonymous_id: 'anon-1',
      browser: 'HaydiGiy App 2.3.24',
      device_id: 'device-1',
      device_type: 'mobile',
      event_name: 'user_signed_up',
      os: 'iOS 18.2',
      page_url: '/cart',
      screen_height: 844,
      screen_width: 390,
      session_id: 'sess-1',
      user_id: 42,
    });
  });

  it('reports screen views under the web event name so both clients share one report', () => {
    const dto = toFirstPartyEventDto(
      { name: 'screen_viewed', screen: '/product/101' },
      buildContext({ screenPath: '/previous' }),
    );

    expect(dto.event_name).toBe('page_viewed');
    // Ekranın kendi yolu, bağlamdaki (henüz güncellenmemiş) yolu ezmelidir.
    expect(dto.page_url).toBe('/product/101');
  });

  it('splits product columns from the properties payload', () => {
    const dto = toFirstPartyEventDto({ name: 'add_to_cart', product }, buildContext());

    expect(dto).toMatchObject({
      category_id: 7,
      event_name: 'add_to_cart',
      price: 199.9,
      product_id: 101,
      quantity: 2,
      variant_id: 9001,
    });
    expect(dto.properties).toMatchObject({
      brand: 'HaydiGiy',
      category_name: 'Tişört',
      currency: 'TRY',
      product_name: 'Basic Tişört',
      raw_product_id: '101',
      raw_variant_id: '9001',
    });
  });

  it('keeps a non-numeric product id in properties when the column cannot take it', () => {
    const dto = toFirstPartyEventDto(
      { name: 'product_viewed', product: { ...product, id: 'SKU-ABC' } },
      buildContext(),
    );

    expect(dto.product_id).toBeNull();
    expect(dto.properties).toMatchObject({ raw_product_id: 'SKU-ABC' });
  });

  it('defaults a missing quantity to one item', () => {
    const dto = toFirstPartyEventDto(
      { name: 'add_to_cart', product: { ...product, quantity: undefined } },
      buildContext(),
    );

    expect(dto.quantity).toBe(1);
  });

  it('carries the search query and result count', () => {
    const dto = toFirstPartyEventDto(
      { name: 'search_performed', query: 'tişört', resultCount: 0 },
      buildContext(),
    );

    expect(dto.event_name).toBe('search_performed');
    expect(dto.properties).toEqual({ query: 'tişört', result_count: 0 });
  });

  it('records a zero-result search as 0, not as unknown', () => {
    const dto = toFirstPartyEventDto(
      { name: 'search_performed', query: 'yok', resultCount: undefined },
      buildContext(),
    );

    expect(dto.properties).toEqual({ query: 'yok', result_count: null });
  });

  it('sums checkout revenue quantity across lines', () => {
    const dto = toFirstPartyEventDto(
      {
        name: 'checkout_started',
        currency: 'TRY',
        products: [product, { ...product, id: '102', quantity: 3 }],
        revenue: 999.5,
      },
      buildContext(),
    );

    expect(dto).toMatchObject({ event_name: 'checkout_started', quantity: 5, revenue: 999.5 });
    expect((dto.properties as { items: unknown[] }).items).toHaveLength(2);
  });

  it('keeps a non-numeric order number reachable in properties', () => {
    const dto = toFirstPartyEventDto(
      {
        name: 'purchase_completed',
        currency: 'TRY',
        orderId: 'HG-2024-ABC',
        products: [product],
        revenue: 399.8,
      },
      buildContext(),
    );

    expect(dto.order_id).toBeNull();
    expect(dto.properties).toMatchObject({ raw_order_id: 'HG-2024-ABC' });
    expect(dto.revenue).toBe(399.8);
  });

  it('distinguishes a bank-pending payment from a failed one', () => {
    const pending = toFirstPartyEventDto(
      { name: 'payment_result', status: 'pending', orderId: '5001' },
      buildContext(),
    );

    expect(pending.order_id).toBe(5001);
    expect(pending.properties).toMatchObject({ status: 'pending' });
  });

  it('reports cart clearing with the number of lines dropped', () => {
    const dto = toFirstPartyEventDto({ name: 'cart_cleared', itemCount: 4 }, buildContext());

    expect(dto).toMatchObject({ event_name: 'cart_cleared', quantity: 4 });
  });

  it('carries the applied filter selection', () => {
    const dto = toFirstPartyEventDto(
      { name: 'filter_applied', filters: { color: 'siyah', maxPrice: 500 } },
      buildContext(),
    );

    expect(dto.properties).toEqual({ filters: { color: 'siyah', maxPrice: 500 } });
  });

  it('reports a guest session with a null user id', () => {
    const dto = toFirstPartyEventDto({ name: 'user_signed_up' }, buildContext({ userId: null }));

    expect(dto.user_id).toBeNull();
  });
});
