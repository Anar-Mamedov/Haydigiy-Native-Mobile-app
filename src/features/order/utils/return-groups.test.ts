import { OrderDetailItem } from '@/types/order.types';
import {
  buildReturnRequestGroups,
  COMPLETED_RETURNS_GROUP_KEY,
  describeReturnGroup,
} from './return-groups';

function returned(overrides: Partial<OrderDetailItem> = {}): OrderDetailItem {
  return {
    id: 1,
    name: 'İade Ürünü',
    variantName: 'S',
    slug: 'iade-urunu',
    image: null,
    quantity: 1,
    price: 100,
    kind: 'returned',
    returnRequestId: 42,
    returnCode: 'RC-42',
    returnRequestedAt: '04 Tem 2026 - 23:26',
    returnReceivedAt: null,
    returnStatusCode: 1,
    returnStatusName: null,
    ...overrides,
  };
}

// Web sipariş detayı `returnDisplayGroups` paritesi.
describe('buildReturnRequestGroups', () => {
  it('returns no groups when nothing was returned', () => {
    expect(buildReturnRequestGroups([])).toEqual([]);
    expect(buildReturnRequestGroups(undefined)).toEqual([]);
  });

  it('gives every return request its own card with code, status and items', () => {
    const groups = buildReturnRequestGroups([
      returned({ id: 1, returnRequestId: 42, returnCode: 'RC-42' }),
      returned({ id: 2, returnRequestId: 43, returnCode: 'RC-43', returnStatusCode: 4 }),
      returned({ id: 3, returnRequestId: 42, returnCode: 'RC-42' }),
    ]);

    expect(groups.map((group) => group.key)).toEqual(['42', '43']);
    expect(groups[0]).toMatchObject({
      returnRequestId: 42,
      returnCode: 'RC-42',
      statusCode: 1,
      isCompleted: false,
    });
    expect(groups[0]?.items.map((item) => item.id)).toEqual([1, 3]);
    expect(groups[1]).toMatchObject({ returnRequestId: 43, returnCode: 'RC-43', statusCode: 4 });
  });

  // Web `Object.values` ile grupladığı için sayısal talep id'leri küçükten büyüğe dizilir.
  it('orders requests by ascending request id and keeps id-less lines last', () => {
    const groups = buildReturnRequestGroups([
      returned({ id: 1, returnRequestId: 90 }),
      returned({ id: 2, returnRequestId: null }),
      returned({ id: 3, returnRequestId: 12 }),
    ]);

    expect(groups.map((group) => group.returnRequestId)).toEqual([12, 90, null]);
  });

  it('merges every completed request into one trailing card without a return code', () => {
    const groups = buildReturnRequestGroups([
      returned({ id: 1, returnRequestId: 40, returnStatusCode: 7, returnCode: 'RC-40' }),
      returned({ id: 2, returnRequestId: 41, returnStatusCode: 2, returnCode: 'RC-41' }),
      returned({ id: 3, returnRequestId: 44, returnStatusCode: 7, returnCode: 'RC-44' }),
    ]);

    expect(groups.map((group) => group.key)).toEqual(['41', COMPLETED_RETURNS_GROUP_KEY]);
    const completed = groups[1];
    expect(completed).toMatchObject({
      returnRequestId: null,
      returnCode: null,
      statusCode: 7,
      isCompleted: true,
      cancellable: false,
    });
    expect(completed?.items.map((item) => item.id)).toEqual([1, 3]);
  });

  it('marks a request cancellable only while a line is pending and not yet received', () => {
    const [pending, received, shipped] = buildReturnRequestGroups([
      returned({ id: 1, returnRequestId: 1, returnStatusCode: 1 }),
      returned({ id: 2, returnRequestId: 2, returnStatusCode: 1, returnReceivedAt: '05 Tem 2026' }),
      returned({ id: 3, returnRequestId: 3, returnStatusCode: 4 }),
    ]);

    expect(pending?.cancellable).toBe(true);
    expect(received?.cancellable).toBe(false);
    expect(shipped?.cancellable).toBe(false);
  });

  it('treats a blank return code as missing', () => {
    const [group] = buildReturnRequestGroups([returned({ returnCode: '  ' })]);
    expect(group?.returnCode).toBeNull();
  });
});

describe('describeReturnGroup', () => {
  it('builds the web summary line from the item count and status', () => {
    const [shipped] = buildReturnRequestGroups([
      returned({ id: 1, returnStatusCode: 4 }),
      returned({ id: 2, returnStatusCode: 4 }),
    ]);
    expect(describeReturnGroup(shipped!)).toBe('2 ürün için iade ürünleriniz kargo ile yolda.');

    const [pending] = buildReturnRequestGroups([returned()]);
    expect(describeReturnGroup(pending!)).toBe('1 ürün için iade talebiniz işleme alındı.');
  });
});
