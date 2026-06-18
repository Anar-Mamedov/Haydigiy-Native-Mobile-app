import { mapOrderDetail } from './order-detail.mapper';
import { OrderDetailResponseDto } from './order-detail.dtos';

function baseDetail(overrides: Partial<OrderDetailResponseDto> = {}): OrderDetailResponseDto {
  return {
    id: 758933,
    order_no: 'HG050626758933',
    created_at: '2026-06-05T14:16:16.000000Z',
    delivered_at: '2026-06-05T14:42:27.000000Z',
    status: 'Teslim Edildi',
    status_color: '#10b981',
    status_id: 8,
    tracking_code: 'TRK123',
    cargo_company_name: 'Yurtiçi',
    invoice_pdf_url: 'https://cdn/invoice.pdf',
    payment_method: 'Kapıda Ödeme',
    billing_type: 'individual',
    tc_number: '12345678901',
    shipping_address: {
      name: 'Anar',
      surname: 'Mamedov',
      phone: '5076534641',
      address_line: 'ofis',
      neighbourhood: 'Merkez',
      district: 'Merkez',
      city: 'Niğde',
      zip_code: '00000',
    },
    billing_address: null,
    totals: {
      subtotal: '2294.97',
      user_discount_amount: '0.00',
      coupon_discount_amount: '0.00',
      campaign_discount_amount: null,
      cargo_service_price: '99.99',
      cod_service_fee: '19.99',
      payment_fee: '0.00',
      total_price: '2414.95',
    },
    items: [{ id: 1, name: 'Ürün', variant_name: 'M', slug: 'urun', quantity: 1, price: '1147.49' }],
    ...overrides,
  };
}

describe('mapOrderDetail', () => {
  it('maps the core order detail fields and totals', () => {
    const order = mapOrderDetail(baseDetail());

    expect(order.orderNo).toBe('HG050626758933');
    expect(order.createdAt).toBe('2026-06-05'); // ISO trimmed
    expect(order.statusId).toBe(8);
    expect(order.trackingCode).toBe('TRK123');
    expect(order.items).toHaveLength(1);
    expect(order.items[0]?.kind).toBe('normal');
    expect(order.totals.subtotal).toBe(2294.97);
    expect(order.totals.cargoFee).toBe(99.99);
    expect(order.totals.codFee).toBe(19.99);
    expect(order.totals.total).toBe(2414.95);
    expect(order.shippingAddress?.city).toBe('Niğde');
  });

  it('normalizes a keyed-object items map into an array', () => {
    const order = mapOrderDetail(
      baseDetail({ items: { 0: { id: 1, name: 'A', slug: 'a' }, 1: { id: 2, name: 'B', slug: 'b' } } }),
    );
    expect(order.items).toHaveLength(2);
  });

  it('flags a fully cancelled order', () => {
    const order = mapOrderDetail(
      baseDetail({
        status_id: 4,
        items: [],
        cancelled_items: [{ order_item_id: 9, name: 'X', quantity: 2 }],
      }),
    );
    expect(order.isFullyCancelled).toBe(true);
    expect(order.cancelledItems[0]?.kind).toBe('cancelled');
    expect(order.cancelledQty).toBe(2);
  });

  it('tags returned items and surfaces their status note', () => {
    const order = mapOrderDetail(
      baseDetail({
        returned_items: [
          { order_item_id: 5, name: 'R', quantity: 1, status_name: 'İade Onaylandı' },
        ],
      }),
    );
    expect(order.returnedItems[0]?.kind).toBe('returned');
    expect(order.returnedItems[0]?.note).toBe('İade Onaylandı');
  });
});
