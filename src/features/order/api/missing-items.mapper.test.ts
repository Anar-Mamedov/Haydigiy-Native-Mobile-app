import { mapMissingCases } from './missing-items.mapper';
import { MissingItemsDto, OrderDetailItemDto } from './order-detail.dtos';

const ORDER_ITEMS: OrderDetailItemDto[] = [
  { id: 10, name: 'Elbise', slug: 'elbise' },
  { id: 11, name: 'Ceket', slug: '' },
];

function baseMissingItems(overrides: Partial<MissingItemsDto> = {}): MissingItemsDto {
  return {
    products: [
      {
        id: 1,
        case_no: 'EK-1001',
        status: 'reported',
        status_label: 'İnceleniyor',
        resolution_note: '  Telafi gönderisi hazırlandı.  ',
        items: [
          {
            id: 100,
            order_item_id: 10,
            name: 'Elbise',
            image: 'https://cdn.haydigiy.com/elbise.jpg',
            variant_name: 'M',
            missing_quantity: '2',
          },
        ],
      },
    ],
    parts: [
      {
        id: 2,
        case_no: 'EP-2002',
        status: 'resolved',
        items: [{ id: 200, order_item_id: 11, name: 'Ceket', image: 'urun/ceket.jpg', missing_quantity: 1 }],
      },
    ],
    delivery_items: [
      {
        id: 991,
        order_no: 'EK-1001',
        status_id: 6,
        status: 'Kargoda',
        cargo_company_name: 'Hepsijet',
        tracking_code: 'TRK777',
        items: [{ id: 1, name: 'Elbise', quantity: 2 }],
      },
    ],
    ...overrides,
  };
}

describe('mapMissingCases', () => {
  it('returns no cases when the order has no missing-item reports', () => {
    expect(mapMissingCases(null, ORDER_ITEMS)).toEqual([]);
    expect(mapMissingCases(undefined, ORDER_ITEMS)).toEqual([]);
    expect(mapMissingCases({}, ORDER_ITEMS)).toEqual([]);
  });

  it('lists missing products before missing parts', () => {
    const cases = mapMissingCases(baseMissingItems(), ORDER_ITEMS);

    expect(cases.map((item) => [item.kind, item.caseNo])).toEqual([
      ['product', 'EK-1001'],
      ['part', 'EP-2002'],
    ]);
  });

  it('maps lines with the order slug, a numeric quantity and a CDN image', () => {
    const [product, part] = mapMissingCases(baseMissingItems(), ORDER_ITEMS);

    expect(product.lines).toEqual([
      {
        id: 100,
        name: 'Elbise',
        image: 'https://cdn.haydigiy.com/elbise.jpg',
        variantName: 'M',
        missingQuantity: 2,
        slug: 'elbise',
      },
    ]);
    // Slug'ı olmayan sipariş satırı ürüne gidemez; görsel yolu CDN'e çevrilir.
    expect(part.lines[0].slug).toBe('');
    expect(part.lines[0].image).toBe('https://cdn.haydigiy.com/urun/ceket.jpg');
  });

  it('uses the backend status label and falls back by resolution state', () => {
    const [product, part] = mapMissingCases(baseMissingItems(), ORDER_ITEMS);

    expect(product).toMatchObject({ isResolved: false, statusLabel: 'İnceleniyor' });
    expect(part).toMatchObject({ isResolved: true, statusLabel: 'Çözüldü' });

    const [open] = mapMissingCases(
      baseMissingItems({ products: [{ id: 3, case_no: 'EK-3', status: 'reported', items: [] }], parts: [] }),
      ORDER_ITEMS,
    );
    expect(open.statusLabel).toBe('Bildirildi');
  });

  it('attaches the compensation shipment whose order number matches the case number', () => {
    const [product, part] = mapMissingCases(baseMissingItems(), ORDER_ITEMS);

    expect(product.delivery).toEqual({
      orderId: 991,
      orderNo: 'EK-1001',
      status: 'Kargoda',
      cargoCompanyName: 'Hepsijet',
      trackingCode: 'TRK777',
      itemCount: 1,
    });
    expect(part.delivery).toBeNull();
  });

  it('trims the resolution note and drops a blank one', () => {
    const [product, part] = mapMissingCases(baseMissingItems(), ORDER_ITEMS);

    expect(product.resolutionNote).toBe('Telafi gönderisi hazırlandı.');
    expect(part.resolutionNote).toBeNull();
  });
});
