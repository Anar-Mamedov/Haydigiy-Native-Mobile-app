import { resolveProductActionState } from './product-action-state';

const inStock = {
  isApprovedForSale: true,
  isAuthenticated: true,
  isNotified: false,
  isOutOfStock: false,
};

describe('resolveProductActionState', () => {
  it('adds to cart while the selected size is in stock', () => {
    expect(resolveProductActionState(inStock)).toBe('add-to-cart');
  });

  it('keeps add-to-cart when the product is closed for sale, even if sold out', () => {
    expect(
      resolveProductActionState({ ...inStock, isApprovedForSale: false, isOutOfStock: true }),
    ).toBe('add-to-cart');
  });

  it('only reports sold out to a signed-out visitor', () => {
    expect(
      resolveProductActionState({ ...inStock, isAuthenticated: false, isOutOfStock: true }),
    ).toBe('sold-out-guest');
  });

  it('offers the notification for a signed-in visitor', () => {
    expect(resolveProductActionState({ ...inStock, isOutOfStock: true })).toBe('notify-available');
  });

  it('confirms an already-sent request instead of offering it again', () => {
    expect(resolveProductActionState({ ...inStock, isNotified: true, isOutOfStock: true })).toBe(
      'notify-requested',
    );
  });
});
