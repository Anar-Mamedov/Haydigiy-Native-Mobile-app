import { resolveProductActionState } from './product-action-state';

const inStock = {
  isApprovedForSale: true,
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

  // Oturum durumu artık karara girmiyor: misafir de butonu görür, girişe
  // yönlendirme ve talebi tamamlama işi `useNotifyStock`'a ait.
  it('offers the notification to every visitor once the size is sold out', () => {
    expect(resolveProductActionState({ ...inStock, isOutOfStock: true })).toBe('notify-available');
  });

  it('confirms an already-sent request instead of offering it again', () => {
    expect(resolveProductActionState({ ...inStock, isNotified: true, isOutOfStock: true })).toBe(
      'notify-requested',
    );
  });
});
