import { buildOrderItemGroups, expandGroupsToMembers } from './order-item-groups';
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
  it('collapses the five order lines into one bundle row plus one normal row', () => {
    const groups = buildOrderItemGroups(items, displayItems);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ expandedId: `bundle:${BUNDLE_GROUP}`, isBundle: true });
    expect(groups[1]).toMatchObject({ expandedId: '11845556-0', isBundle: false });
  });

  it('shows the bundle with its own name, image and price from display_items', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.item.name).toBe('Deneme bundle');
    expect(bundle.item.variantName).toBe('4 ürün');
    expect(bundle.item.image).toBe('https://cdn/deneme-bundle.webp');
    expect(bundle.item.price).toBe(5000);
  });

  it('carries every real order_item of the bundle so it is cancelled/returned as a whole', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.members.map((member) => member.orderItemId).sort()).toEqual([
      11845555, 11845557, 11845558, 11845559,
    ]);
  });

  it('lists the package contents for display only', () => {
    const [bundle] = buildOrderItemGroups(items, displayItems);

    expect(bundle.components).toHaveLength(4);
    expect(bundle.components[0]).toMatchObject({
      orderItemId: 11845555,
      title: 'Kemer Detaylı Yarım Kol Elbise Siyah',
      variantName: 'L',
      quantity: 1,
    });
  });

  it('closes the whole bundle when any component is non-returnable', () => {
    const withBlocked = items.map((item) =>
      item.id === 11845558 ? { ...item, isNonReturnable: true } : item,
    );
    const [bundle] = buildOrderItemGroups(withBlocked, displayItems);

    expect(bundle.isNonReturnable).toBe(true);
  });

  it('treats the bundle as a gift only when every component is a gift', () => {
    const allGift = items.map((item) =>
      item.bundleGroupId ? { ...item, returnStatus: 'gift_product' } : item,
    );
    expect(buildOrderItemGroups(allGift, displayItems)[0].returnStatus).toBe('gift_product');

    const partialGift = items.map((item) =>
      item.id === 11845555 ? { ...item, returnStatus: 'gift_product' } : item,
    );
    expect(buildOrderItemGroups(partialGift, displayItems)[0].returnStatus).not.toBe('gift_product');
  });

  it('still splits normal products by quantity', () => {
    const groups = buildOrderItemGroups([makeItem({ id: 500, quantity: 3 })]);

    expect(groups.map((group) => group.expandedId)).toEqual(['500-0', '500-1', '500-2']);
    expect(groups[0].members).toEqual([{ orderItemId: 500, quantity: 1 }]);
  });

  it('groups by bundleGroupId even without display_items, falling back to summed prices', () => {
    const groups = buildOrderItemGroups(items);
    const [bundle] = groups;

    expect(groups).toHaveLength(2);
    expect(bundle.item.name).toBe('Paket Ürün');
    expect(bundle.item.price).toBe(1250 * 4);
  });

  it('tolerates empty input', () => {
    expect(buildOrderItemGroups(null)).toEqual([]);
    expect(buildOrderItemGroups(undefined, null)).toEqual([]);
  });
});

describe('expandGroupsToMembers', () => {
  const groups = buildOrderItemGroups(items, displayItems);

  it('expands a selected bundle into all of its real order items', () => {
    const members = expandGroupsToMembers(groups, [`bundle:${BUNDLE_GROUP}`]);

    expect(members.map((member) => member.orderItemId).sort()).toEqual([
      11845555, 11845557, 11845558, 11845559,
    ]);
  });

  it('sends the same order_item list as before when everything is selected', () => {
    const members = expandGroupsToMembers(
      groups,
      groups.map((group) => group.expandedId),
    );

    expect(members.map((member) => member.orderItemId).sort()).toEqual([
      11845555, 11845556, 11845557, 11845558, 11845559,
    ]);
  });

  it('ignores unknown ids', () => {
    expect(expandGroupsToMembers(groups, ['nope'])).toEqual([]);
  });
});
