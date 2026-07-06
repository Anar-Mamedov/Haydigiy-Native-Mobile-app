import { mapOrderDetail } from './order-detail.mapper';
import { OrderDetailResponseDto } from './order-detail.dtos';

function baseDetail(overrides: Partial<OrderDetailResponseDto> = {}): OrderDetailResponseDto {
  return {
    id: 758933,
    order_no: 'HG050626758933',
    created_at: '2026-06-05T14:16:16.000000Z',
    confirmed_at: '05 Haz 2026 - 14:18',
    shipped_at: '06 Haz 2026 - 09:30',
    delivered_at: '2026-06-05T14:42:27.000000Z',
    status: 'Teslim Edildi',
    status_color: '#10b981',
    status_id: 8,
    tracking_code: 'TRK123',
    cargo_company_name: 'Yurtiçi',
    cargo_company_logo: 'https://cdn/cargo-logo.png',
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
    expect(order.timelineDates).toEqual({
      orderedAt: '2026-06-05',
      confirmedAt: '05 Haz 2026 - 14:18',
      preparedAt: '06 Haz 2026 - 09:30',
      shippedAt: '06 Haz 2026 - 09:30',
      deliveredAt: '2026-06-05',
    });
    expect(order.statusId).toBe(8);
    expect(order.trackingCode).toBe('TRK123');
    expect(order.cargoCompanyLogo).toBe('https://cdn/cargo-logo.png');
    expect(order.items).toHaveLength(1);
    expect(order.items[0]?.kind).toBe('normal');
    expect(order.totals.subtotal).toBe(2294.97);
    expect(order.totals.cargoFee).toBe(99.99);
    expect(order.totals.codFee).toBe(19.99);
    expect(order.totals.total).toBe(2414.95);
    expect(order.shippingAddress?.city).toBe('Niğde');
  });

  // Web sipariş detayı paritesi: iade kartları kod/tarih/durum taşır ve
  // beklemedeki (henüz depoya ulaşmamış) talep iptal edilebilir olarak işaretlenir.
  it('maps return metadata and picks the cancellable pending return request', () => {
    const order = mapOrderDetail(
      baseDetail({
        returned_items: [
          {
            order_item_id: 5,
            name: 'İade Ürünü',
            quantity: 1,
            price: '139.99',
            return_request_id: 42,
            return_code: 'HG1-R',
            requested_at: '04 Tem 2026 - 23:26',
            status: 'pending',
            status_name: '',
            is_hepsijet: true,
          },
          {
            order_item_id: 6,
            name: 'Kargodaki İade',
            quantity: 1,
            price: '89.99',
            return_request_id: 43,
            status: 4,
            received_at: null,
          },
        ],
      }),
    );

    const [pending, shipped] = order.returnedItems;
    expect(pending?.returnCode).toBe('HG1-R');
    expect(pending?.returnRequestedAt).toBe('04 Tem 2026 - 23:26');
    expect(pending?.returnStatusCode).toBe(1);
    expect(shipped?.returnStatusCode).toBe(4);
    expect(order.cancellableReturnRequestId).toBe(42);
    expect(order.hasHepsijetReturn).toBe(true);
  });

  it('leaves no cancellable return when all requests shipped or were received', () => {
    const order = mapOrderDetail(
      baseDetail({
        returned_items: [
          { order_item_id: 5, return_request_id: 42, status: 1, received_at: '2026-07-05' },
          { order_item_id: 6, return_request_id: 43, status: 4 },
        ],
      }),
    );

    expect(order.cancellableReturnRequestId).toBeNull();
    expect(order.hasHepsijetReturn).toBe(false);
  });

  it('maps the cancellation date onto cancelled items', () => {
    const order = mapOrderDetail(
      baseDetail({
        cancelled_items: [
          { order_item_id: 9, name: 'İptal Ürünü', cancelled_at: '04 Tem 2026 - 14:49' },
        ],
      }),
    );

    expect(order.cancelledItems[0]?.cancelledAt).toBe('04 Tem 2026 - 14:49');
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

  it('maps product/variant ids and the reviewed flag for items', () => {
    const reviewed = mapOrderDetail(
      baseDetail({
        items: [
          { id: 1, name: 'A', slug: 'a', product_id: 10, variant_id: 20, product_review: true },
        ],
      }),
    );
    expect(reviewed.items[0]?.productId).toBe(10);
    expect(reviewed.items[0]?.variantId).toBe(20);
    expect(reviewed.items[0]?.isReviewed).toBe(true);

    const notReviewed = mapOrderDetail(
      baseDetail({ items: [{ id: 2, name: 'B', slug: 'b', reviews_count: 0 }] }),
    );
    expect(notReviewed.items[0]?.isReviewed).toBe(false);
  });

  it('omits installment info for an upfront order', () => {
    const order = mapOrderDetail(baseDetail());
    expect(order.totals.hasInstallmentInfo).toBe(false);
    expect(order.totals.installmentCount).toBeNull();
    expect(order.totals.payableTotal).toBe(2414.95);
  });

  it('surfaces installment fields and charges the installment total when paid in installments', () => {
    const order = mapOrderDetail(
      baseDetail({
        installment_count: 6,
        totals: {
          subtotal: '2294.97',
          cargo_service_price: '99.99',
          cod_service_fee: '0.00',
          payment_fee: '0.00',
          total_price: '2414.95',
          interest_amount: '150.00',
          total_with_interest: '2564.95',
        },
      }),
    );
    expect(order.totals.hasInstallmentInfo).toBe(true);
    expect(order.totals.installmentCount).toBe(6);
    expect(order.totals.interestAmount).toBe(150);
    expect(order.totals.totalWithInterest).toBe(2564.95);
    expect(order.totals.total).toBe(2414.95); // peşin toplam
    expect(order.totals.payableTotal).toBe(2564.95); // taksitli toplam
  });

  it('ignores an installment count of 1 (single payment)', () => {
    const order = mapOrderDetail(baseDetail({ installment_count: 1 }));
    expect(order.totals.installmentCount).toBeNull();
    expect(order.totals.hasInstallmentInfo).toBe(false);
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
