import {
  clearPurchaseSnapshot,
  consumePurchaseSnapshot,
  setPurchaseSnapshot,
} from './purchase-snapshot';
import { CartLineItem } from '@/types/cart.types';

function makeItem(productId: string): CartLineItem {
  return {
    productId,
    title: `Ürün ${productId}`,
    imageUrl: '',
    sellerName: '',
    quantity: 1,
    unitPrice: 100,
  };
}

beforeEach(() => {
  clearPurchaseSnapshot();
});

describe('purchase snapshot', () => {
  it('stores a copy of the submitted lines and returns them once', () => {
    const items = [makeItem('1'), makeItem('2')];
    setPurchaseSnapshot(items);

    const consumed = consumePurchaseSnapshot();
    expect(consumed).toHaveLength(2);
    expect(consumed?.[0]).not.toBe(items[0]);
    expect(consumed?.[0]).toEqual(items[0]);

    // Second consume must be empty so the purchase event cannot fire twice.
    expect(consumePurchaseSnapshot()).toBeNull();
  });

  it('overwrites the previous snapshot on a new submit', () => {
    setPurchaseSnapshot([makeItem('1')]);
    setPurchaseSnapshot([makeItem('2')]);

    expect(consumePurchaseSnapshot()?.[0]?.productId).toBe('2');
  });

  it('clears without returning anything', () => {
    setPurchaseSnapshot([makeItem('1')]);
    clearPurchaseSnapshot();
    expect(consumePurchaseSnapshot()).toBeNull();
  });
});
