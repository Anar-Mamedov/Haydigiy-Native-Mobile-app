import { buildOrderDisplayRows } from './order-display-rows';
import { OrderDetailItem } from '@/types/order.types';

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

const BUNDLE_GROUP = '101703d9';

const items: OrderDetailItem[] = [
  makeItem({ id: 8801, name: 'Kemer Detaylı Elbise', bundleGroupId: BUNDLE_GROUP }),
  makeItem({ id: 8802, name: 'Kruvaze Ceket', variantName: 'M', bundleGroupId: BUNDLE_GROUP }),
  makeItem({ id: 9001, name: 'Uzun Kollu Gömlek', variantName: 'STANDART', price: 309.99, quantity: 2 }),
];

const displayItems: OrderDetailItem[] = [
  makeItem({
    id: 8801,
    name: 'Deneme bundle',
    variantName: '2 ürün',
    slug: 'deneme-bundle',
    image: 'https://cdn/deneme-bundle.webp',
    price: 2000,
    bundleGroupId: BUNDLE_GROUP,
  }),
];

describe('buildOrderDisplayRows', () => {
  it('prints the package as one row and the normal product as another', () => {
    const rows = buildOrderDisplayRows(items, displayItems);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: 'Deneme bundle', isBundle: true, price: 2000 });
    expect(rows[1]).toMatchObject({ id: 9001, name: 'Uzun Kollu Gömlek' });
  });

  it('never repeats a product just because more than one was ordered', () => {
    const rows = buildOrderDisplayRows(items, displayItems);

    expect(rows.filter((row) => row.id === 9001)).toHaveLength(1);
    expect(rows[1].quantity).toBe(2);
  });

  it('lists the package contents read-only underneath the package row', () => {
    const [bundle] = buildOrderDisplayRows(items, displayItems);

    expect(bundle.bundleComponents).toHaveLength(2);
    expect(bundle.bundleComponents?.[1]).toMatchObject({
      orderItemId: 8802,
      title: 'Kruvaze Ceket',
      variantName: 'M',
      quantity: 1,
    });
  });

  it('falls back to the summed component prices without display_items', () => {
    const [bundle] = buildOrderDisplayRows(items);

    expect(bundle.name).toBe('Paket Ürün');
    expect(bundle.price).toBe(2500);
  });

  it('tolerates empty input', () => {
    expect(buildOrderDisplayRows(null)).toEqual([]);
    expect(buildOrderDisplayRows(undefined, null)).toEqual([]);
  });
});
