import {
  buildOrderItemGroups,
  filterGroupRows,
  findGroupByOrderItemId,
  flattenGroupRows,
  getGroupRowIds,
  getPreselectRowIds,
} from './order-item-groups';
import { OrderDetailItem } from '@/types/order.types';

/** Canlı HG2208261387277 siparişinden sadeleştirilmiş satırlar. */
function makeItem(overrides: Partial<OrderDetailItem> & { id: number }): OrderDetailItem {
  return {
    name: 'Ürün',
    variantName: 'L',
    slug: 'urun',
    image: 'https://cdn/urun.webp',
    quantity: 1,
    price: 1250,
    kind: 'normal',
    ...overrides,
  };
}

const BUNDLE_GROUP = '101703d9-b539-458e-ba74-8f334359e14f';

const items: OrderDetailItem[] = [
  makeItem({ id: 11845555, name: 'Kemer Detaylı Yarım Kol Elbise Siyah', bundleGroupId: BUNDLE_GROUP, bundleItemId: 2 }),
  makeItem({ id: 11845556, name: 'Uzun Kollu Cepli Gömlek Siyah', variantName: 'STANDART', price: 309.99 }),
  makeItem({ id: 11845557, name: 'Raşel Kumaş İkili Takım Açıkhaki', bundleGroupId: BUNDLE_GROUP, bundleItemId: 1 }),
  makeItem({ id: 11845558, name: 'Palazzo Kot Pantolon Çelikmavi', variantName: '36', bundleGroupId: BUNDLE_GROUP, bundleItemId: 4 }),
  makeItem({ id: 11845559, name: 'Yıldız Baskılı Modal Eşofman Altı', bundleGroupId: BUNDLE_GROUP, bundleItemId: 3 }),
];

const displayItems: OrderDetailItem[] = [
  makeItem({
    id: 11845555,
    name: 'Deneme bundle',
    variantName: '4 ürün',
    slug: 'deneme-bundle',
    image: 'https://cdn/deneme-bundle.webp',
    price: 5000,
    bundleGroupId: BUNDLE_GROUP,
  }),
  makeItem({ id: 11845556, name: 'Uzun Kollu Cepli Gömlek Siyah', variantName: 'STANDART', price: 309.99 }),
];

describe('buildOrderItemGroups', () => {
  it('keeps the package as one visual group next to the standalone product', () => {
    const groups = buildOrderItemGroups(items, displayItems);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ groupId: `bundle:${BUNDLE_GROUP}`, isBundle: true });
    expect(groups[1]).toMatchObject({ groupId: 'item:11845556', isBundle: false });
  });

  it('makes every product inside the package individually selectable', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.rows.map((row) => row.expandedId)).toEqual([
      '11845555-0',
      '11845557-0',
      '11845558-0',
      '11845559-0',
    ]);
    expect(bundle.rows.every((row) => row.isBundleComponent)).toBe(true);
  });

  it('shows each package row with its own product name and size', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.rows[0].item.name).toBe('Kemer Detaylı Yarım Kol Elbise Siyah');
    expect(bundle.rows[2].item.variantName).toBe('36');
  });

  it('keeps every row pointing at its real order_item so partial requests are possible', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.rows.map((row) => row.orderItemId)).toEqual([
      11845555, 11845557, 11845558, 11845559,
    ]);
    expect(bundle.rows.every((row) => row.quantity === 1)).toBe(true);
  });

  it('titles the group with the package name, image and price from display_items', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.header).toEqual({
      title: 'Deneme bundle',
      subtitle: '4 ürün',
      imageUrl: 'https://cdn/deneme-bundle.webp',
      price: 5000,
      quantity: 1,
    });
  });

  it('blocks only the non-returnable product, not the whole package', () => {
    const withBlocked = items.map((item) =>
      item.id === 11845558 ? { ...item, isNonReturnable: true } : item,
    );
    const [bundle] = buildOrderItemGroups(withBlocked, displayItems);

    expect(bundle.rows.filter((row) => row.isNonReturnable).map((row) => row.orderItemId)).toEqual([
      11845558,
    ]);
  });

  it('marks gift rows one by one instead of judging the whole package', () => {
    const partialGift = items.map((item) =>
      item.id === 11845555 ? { ...item, returnStatus: 'gift_product' } : item,
    );
    const [bundle] = buildOrderItemGroups(partialGift, displayItems);

    expect(bundle.rows[0].returnStatus).toBe('gift_product');
    expect(bundle.rows[1].returnStatus).toBeUndefined();
  });

  it('splits products by quantity, inside and outside a package', () => {
    const groups = buildOrderItemGroups([
      makeItem({ id: 500, quantity: 3 }),
      makeItem({ id: 600, quantity: 2, bundleGroupId: BUNDLE_GROUP }),
    ]);

    expect(groups[0].rows.map((row) => row.expandedId)).toEqual(['500-0', '500-1', '500-2']);
    expect(groups[1].rows.map((row) => row.expandedId)).toEqual(['600-0', '600-1']);
  });

  it('groups by bundleGroupId even without display_items, falling back to summed prices', () => {
    const groups = buildOrderItemGroups(items);

    expect(groups).toHaveLength(2);
    expect(groups[0].header).toMatchObject({ title: 'Paket Ürün', price: 1250 * 4 });
  });

  it('tolerates empty input', () => {
    expect(buildOrderItemGroups(null)).toEqual([]);
    expect(buildOrderItemGroups(undefined, null)).toEqual([]);
  });
});

describe('grup yardımcıları', () => {
  const groups = buildOrderItemGroups(items, displayItems);

  it('flattens every selectable row in screen order', () => {
    expect(flattenGroupRows(groups).map((row) => row.orderItemId)).toEqual([
      11845555, 11845557, 11845558, 11845559, 11845556,
    ]);
  });

  it('drops filtered-out rows and keeps the package that still has returnable products', () => {
    const withBlocked = buildOrderItemGroups(
      items.map((item) => (item.id === 11845558 ? { ...item, isNonReturnable: true } : item)),
      displayItems,
    );

    const returnable = filterGroupRows(withBlocked, (row) => !row.isNonReturnable);

    expect(returnable).toHaveLength(2);
    expect(returnable[0].rows.map((row) => row.orderItemId)).toEqual([
      11845555, 11845557, 11845559,
    ]);
  });

  it('drops a group whose rows are all filtered out', () => {
    const returnable = filterGroupRows(
      buildOrderItemGroups(items.map((item) => ({ ...item, isNonReturnable: true })), displayItems),
      (row) => !row.isNonReturnable,
    );

    expect(returnable).toEqual([]);
  });

  it('finds the owning group from any real order_item id', () => {
    expect(findGroupByOrderItemId(groups, 11845558)?.groupId).toBe(`bundle:${BUNDLE_GROUP}`);
    expect(findGroupByOrderItemId(groups, 11845556)?.groupId).toBe('item:11845556');
    expect(findGroupByOrderItemId(groups, 42)).toBeNull();
  });

  it('lists every row id of a group for the "select the whole package" box', () => {
    expect(getGroupRowIds(groups[0])).toEqual([
      '11845555-0',
      '11845557-0',
      '11845558-0',
      '11845559-0',
    ]);
  });

  it('preselects the whole package but only one unit of a normal product', () => {
    const multiUnit = buildOrderItemGroups([makeItem({ id: 700, quantity: 3 })]);

    expect(getPreselectRowIds(groups[0])).toHaveLength(4);
    expect(getPreselectRowIds(multiUnit[0])).toEqual(['700-0']);
  });
});
