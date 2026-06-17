import { mapOrderDto, mapOrdersResponse, mapReturnRequestDto } from './order.mapper';
import { OrderDto } from './order.dtos';

function baseOrder(overrides: Partial<OrderDto> = {}): OrderDto {
  return {
    id: 1,
    order_no: 'HG-100',
    status: 'Kargoya Verildi',
    status_color: '#f27a1a',
    total_price: '149,99 TL',
    created_at: '17 Haziran 2026 - 12:00',
    shipment_count: 1,
    product_count: 2,
    receiver: 'Anar Mamedov',
    products: [
      { name: 'Ürün A', variant_name: 'M', image: 'a.jpg', slug: 'urun-a' },
      { name: 'Ürün B', variant_name: 'L', image: null, slug: 'urun-b' },
    ],
    ...overrides,
  };
}

describe('mapOrderDto', () => {
  it('maps an order and tags normal/returned/cancelled products', () => {
    const order = mapOrderDto(
      baseOrder({
        returned_items: [{ name: 'İade Ürün', quantity: 1, slug: 'iade' }],
        cancelled_items: [{ name: 'İptal Ürün', quantity: 1, slug: 'iptal' }],
      }),
    );

    expect(order.orderNo).toBe('HG-100');
    expect(order.products).toHaveLength(4);
    expect(order.products.map((p) => p.kind)).toEqual([
      'normal',
      'normal',
      'returned',
      'cancelled',
    ]);
  });

  it('normalizes a keyed-object products map into an array', () => {
    const order = mapOrderDto(
      baseOrder({ products: { 0: { name: 'X', slug: 'x' }, 1: { name: 'Y', slug: 'y' } } }),
    );
    expect(order.products).toHaveLength(2);
    expect(order.products[0]?.name).toBe('X');
  });

  it('flags a fully cancelled order (no active or returned items)', () => {
    const order = mapOrderDto(
      baseOrder({
        product_count: 0,
        products: [],
        cancelled_items: [{ name: 'İptal', quantity: 2 }],
      }),
    );
    expect(order.isFullyCancelled).toBe(true);
  });

  it('falls back to order_number then "-" for the order no', () => {
    expect(mapOrderDto(baseOrder({ order_no: undefined, order_number: 'ON-5' })).orderNo).toBe('ON-5');
    expect(
      mapOrderDto(baseOrder({ order_no: undefined, order_number: undefined })).orderNo,
    ).toBe('-');
  });
});

describe('mapOrdersResponse', () => {
  it('maps data and meta', () => {
    const page = mapOrdersResponse({
      data: [baseOrder()],
      meta: { current_page: 2, last_page: 5, per_page: 10, total: 42 },
    });
    expect(page.orders).toHaveLength(1);
    expect(page.meta).toEqual({ currentPage: 2, lastPage: 5, perPage: 10, total: 42 });
  });
});

describe('mapReturnRequestDto', () => {
  it('builds an order card from a return request with reasons and a unique row id', () => {
    const order = mapReturnRequestDto({
      id: 9,
      return_code: 'R-1',
      order: { id: 3, order_no: 'HG-3', total_price: '50 TL', created_at: '2026-06-10' },
      items: [
        { quantity: 1, reason: { name: 'Beden büyük geldi' }, thumbnail_path: 'iade.jpg' },
        { quantity: 2, reason: { name: 'Ürünü beğenmedim' } },
      ],
    });
    expect(order.id).toBe(3);
    expect(order.orderNo).toBe('HG-3');
    expect(order.status).toBe('İade Talebi Oluşturuldu');
    expect(order.totalPrice).toBe('50 TL');
    expect(order.productCount).toBe(3);
    // One thumbnail per returned line; image from the return photo or null.
    expect(order.products).toHaveLength(2);
    expect(order.products.every((p) => p.kind === 'returned')).toBe(true);
    expect(order.products[0]?.image).toBe('iade.jpg');
    expect(order.products[1]?.image).toBeNull();
    // Return-request id is the unique row id; reasons are surfaced for the card.
    expect(order.returnRequestId).toBe(9);
    expect(order.returnReasons).toEqual(['Beden büyük geldi', 'Ürünü beğenmedim']);
  });

  it('deduplicates repeated return reasons', () => {
    const order = mapReturnRequestDto({
      id: 10,
      order: { id: 4 },
      items: [
        { quantity: 1, reason: { name: 'Beden büyük geldi' } },
        { quantity: 1, reason: { name: 'Beden büyük geldi' } },
      ],
    });
    expect(order.returnReasons).toEqual(['Beden büyük geldi']);
  });
});
