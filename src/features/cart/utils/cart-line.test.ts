import {
  getCartLineKey,
  getCartLineMaxQuantity,
  getCartLineTarget,
  isBundleCartLine,
} from './cart-line';
import { CartLineItem } from '@/types/cart.types';

const productLine: CartLineItem = {
  imageUrl: '',
  productId: '95236',
  quantity: 1,
  sellerName: '',
  title: 'Uzun Kollu Cepli Gömlek Siyah',
  unitPrice: 309.99,
  variantId: '4321',
  stock: 5,
  itemType: 'product',
};

const bundleLine: CartLineItem = {
  imageUrl: '',
  productId: '97045',
  quantity: 1,
  sellerName: '',
  title: 'Deneme bundle',
  unitPrice: 5000,
  itemType: 'bundle',
  bundleGroupId: '101703d9-b539-458e-ba74-8f334359e14f',
  bundleProductId: '97045',
};

describe('isBundleCartLine', () => {
  it('detects bundle lines by itemType or bundleGroupId', () => {
    expect(isBundleCartLine(bundleLine)).toBe(true);
    expect(isBundleCartLine({ ...productLine, bundleGroupId: 'abc' })).toBe(true);
    expect(isBundleCartLine(productLine)).toBe(false);
    expect(isBundleCartLine(undefined)).toBe(false);
  });
});

describe('getCartLineKey', () => {
  it('keys bundle lines by group id and product lines by variant id', () => {
    expect(getCartLineKey(bundleLine)).toBe('bundle:101703d9-b539-458e-ba74-8f334359e14f');
    expect(getCartLineKey(productLine)).toBe('variant:4321');
  });

  it('gives two bundles distinct keys even though neither has a variantId', () => {
    const other: CartLineItem = { ...bundleLine, bundleGroupId: 'other-group' };
    expect(getCartLineKey(bundleLine)).not.toBe(getCartLineKey(other));
  });
});

describe('getCartLineTarget', () => {
  it('routes bundle lines to the bundle endpoint', () => {
    expect(getCartLineTarget(bundleLine)).toEqual({
      kind: 'bundle',
      bundleGroupId: '101703d9-b539-458e-ba74-8f334359e14f',
    });
  });

  it('routes product lines to the variant endpoint', () => {
    expect(getCartLineTarget(productLine)).toEqual({ kind: 'variant', variantId: '4321' });
  });

  it('returns null when the identifier is missing so no request is sent', () => {
    expect(getCartLineTarget({ ...bundleLine, bundleGroupId: undefined })).toBeNull();
    expect(getCartLineTarget({ ...productLine, variantId: undefined })).toBeNull();
    expect(getCartLineTarget(null)).toBeNull();
  });
});

describe('getCartLineMaxQuantity', () => {
  it('uses the stock when the backend reports it', () => {
    expect(getCartLineMaxQuantity(productLine)).toBe(5);
    expect(getCartLineMaxQuantity({ ...bundleLine, stock: 3 })).toBe(3);
  });

  it('falls back to a fixed cap for bundles without stock, and 0 for products', () => {
    expect(getCartLineMaxQuantity(bundleLine)).toBe(10);
    expect(getCartLineMaxQuantity({ ...productLine, stock: undefined })).toBe(0);
  });
});
