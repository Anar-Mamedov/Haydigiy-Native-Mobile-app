import {
  BUNDLE_MAX_QUANTITY,
  isBundleLine,
  mapBundleComponents,
  mapBundleItems,
  mapBundleSummary,
} from './bundle.mapper';

/** Canlı "Deneme bundle" cevabından sadeleştirilmiş paket kalemi. */
const bundleItemFixture = {
  id: 1,
  component_product_id: 96763,
  quantity: 1,
  regular_line_total: 469.99,
  bundle_unit_price: 333333,
  is_available: true,
  max_quantity: 13,
  product: {
    id: 96763,
    name: 'Raşel Kumaş İkili Takım Açıkhaki - 75247.801.',
    slug: 'rasel-kumas-ikili-takim-acikhaki-75247801-96763',
    price: 469.99,
    image: { thumb: 'https://cdn/rasel-thumb.webp', medium: 'https://cdn/rasel-medium.webp' },
  },
  variants: [
    { id: 188200, product_variant_id: 188200, variant_id: 233, name: 'L', quantity: 13, is_available: true },
    { id: 188202, product_variant_id: 188202, variant_id: 234, name: 'S', quantity: 0, is_available: true },
  ],
};

describe('mapBundleItems', () => {
  it('maps a bundle item with its image and per-product variant ids', () => {
    const [item] = mapBundleItems({ items: [bundleItemFixture] });

    expect(item.bundleItemId).toBe(1);
    expect(item.productId).toBe(96763);
    expect(item.title).toBe('Raşel Kumaş İkili Takım Açıkhaki - 75247.801.');
    expect(item.price).toBe(469.99);
    expect(item.quantity).toBe(1);
    // Görsel `image: { thumb, medium }` nesnesi olarak geliyor; düz string değil.
    expect(item.imageUrl).toBe('https://cdn/rasel-thumb.webp');
  });

  it('selects product_variant_id, not the global variant_id, for cart selections', () => {
    const [item] = mapBundleItems({ items: [bundleItemFixture] });

    // `variant_id: 233` bedenin global tanımıdır ve farklı ürünlerde tekrar eder;
    // hangi ürünün bedeni olduğunu ayırt edemediği için seçim id'si olamaz.
    expect(item.variants.map((variant) => variant.variantId)).toEqual(['188200', '188202']);
  });

  it('derives stock state per variant', () => {
    const [item] = mapBundleItems({ items: [bundleItemFixture] });

    expect(item.variants[0]).toMatchObject({ name: 'L', stock: 13, hasStock: true });
    expect(item.variants[1]).toMatchObject({ name: 'S', stock: 0, hasStock: false });
    expect(item.isAvailable).toBe(true);
  });

  it('marks the item unavailable when the backend closes it', () => {
    const [item] = mapBundleItems({ items: [{ ...bundleItemFixture, is_available: false }] });
    expect(item.isAvailable).toBe(false);
  });

  it('marks the item unavailable when no variant has stock', () => {
    const [item] = mapBundleItems({
      items: [{ ...bundleItemFixture, variants: [{ id: 1, product_variant_id: 1, name: 'L', quantity: 0 }] }],
    });
    expect(item.isAvailable).toBe(false);
  });

  it('drops items without a usable bundle_item_id and tolerates missing data', () => {
    expect(mapBundleItems({ items: [{ product: { name: 'kimliksiz' } }] })).toEqual([]);
    expect(mapBundleItems(null)).toEqual([]);
    expect(mapBundleItems(undefined)).toEqual([]);
  });
});

describe('mapBundleSummary', () => {
  const items = mapBundleItems({ items: [bundleItemFixture] });

  it('prefers the backend regular_total and saving_amount', () => {
    const summary = mapBundleSummary(items, {
      price: 1000448.99,
      regular_total: 1819.96,
      saving_amount: 0,
      is_sellable: false,
      max_quantity: 0,
    });

    expect(summary.bundlePrice).toBe(1000448.99);
    expect(summary.itemsTotal).toBe(1819.96);
    expect(summary.savings).toBe(0);
    expect(summary.savingsPercent).toBe(0);
    expect(summary.isSellable).toBe(false);
    // `max_quantity: 0` anlamlı bir sınır değil; sabit üst sınıra düşülür.
    expect(summary.maxQuantity).toBe(BUNDLE_MAX_QUANTITY);
  });

  it('computes totals and savings when the backend omits them', () => {
    const summary = mapBundleSummary(items, { price: 399.99 });

    expect(summary.itemsTotal).toBe(469.99);
    expect(summary.savings).toBeCloseTo(70, 2);
    expect(summary.savingsPercent).toBe(15);
    expect(summary.isSellable).toBe(true);
  });

  it('closes the bundle when the product is not approved for sale', () => {
    const summary = mapBundleSummary(items, { price: 399.99 }, { isApprovedForSale: false });
    expect(summary.isSellable).toBe(false);
  });
});

describe('mapBundleComponents', () => {
  it('reads name/slug from the `name` variant of the payload', () => {
    const [component] = mapBundleComponents([
      {
        id: 11845555,
        order_item_id: 11845555,
        name: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
        slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
        variant_name: 'XL',
        quantity: 1,
        price: 1250,
        image: 'https://cdn/elbise.webp',
      },
    ]);

    expect(component).toMatchObject({
      orderItemId: 11845555,
      title: 'Kemer Detaylı Yarım Kol Elbise Siyah - 52521.2204.',
      slug: 'kemer-detayli-yarim-kol-elbise-siyah-525212204',
      variantName: 'XL',
      quantity: 1,
      price: 1250,
      imageUrl: 'https://cdn/elbise.webp',
    });
  });

  it('reads name/slug from the `product_name` variant used by the orders list', () => {
    const [component] = mapBundleComponents([
      {
        order_item_id: 11845557,
        product_name: 'Raşel Kumaş İkili Takım Açıkhaki - 75247.801.',
        product_slug: 'rasel-kumas-ikili-takim-acikhaki-75247801-96763',
        variant_name: 'L',
        quantity: 1,
        unit_price: 1250,
        image: { id: 759350, thumb: 'https://cdn/rasel.webp' },
      },
    ]);

    expect(component.title).toBe('Raşel Kumaş İkili Takım Açıkhaki - 75247.801.');
    expect(component.slug).toBe('rasel-kumas-ikili-takim-acikhaki-75247801-96763');
    expect(component.imageUrl).toBe('https://cdn/rasel.webp');
  });

  it('falls back safely and never throws on malformed input', () => {
    expect(mapBundleComponents(null)).toEqual([]);
    const [component] = mapBundleComponents([{}]);
    expect(component).toMatchObject({ title: 'Ürün', quantity: 1, price: null, imageUrl: '', orderItemId: null });
  });
});

describe('isBundleLine', () => {
  it('detects bundle lines by item_type or bundle_group_id', () => {
    expect(isBundleLine({ item_type: 'bundle' })).toBe(true);
    expect(isBundleLine({ bundle_group_id: 'abc' })).toBe(true);
    expect(isBundleLine({ item_type: 'product', bundle_group_id: null })).toBe(false);
    expect(isBundleLine(null)).toBe(false);
  });
});
