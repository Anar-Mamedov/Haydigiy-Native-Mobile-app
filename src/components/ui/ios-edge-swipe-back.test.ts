import { isIosEdgeSwipeBackPath } from '@/components/ui/ios-edge-swipe-back-paths';

describe('isIosEdgeSwipeBackPath', () => {
  it('enables the fallback edge back gesture on hidden tab detail routes', () => {
    expect(isIosEdgeSwipeBackPath('/orders')).toBe(true);
    expect(isIosEdgeSwipeBackPath('/order/123')).toBe(true);
    expect(isIosEdgeSwipeBackPath('/(tabs)/address-form')).toBe(true);
  });

  it('does not enable the fallback edge back gesture on native stack or bottom tab routes', () => {
    expect(isIosEdgeSwipeBackPath('/')).toBe(false);
    expect(isIosEdgeSwipeBackPath('/kategori/sicak-yaz-indirimleri')).toBe(false);
    expect(isIosEdgeSwipeBackPath('/categories')).toBe(false);
    expect(isIosEdgeSwipeBackPath('/cart')).toBe(false);
    expect(isIosEdgeSwipeBackPath('/profile')).toBe(false);
  });
});
