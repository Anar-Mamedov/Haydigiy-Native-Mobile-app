import {
  DISCOUNT_DISPLAY_THRESHOLDS,
  getDiscountPercent,
  isDisplayableDiscountPercent,
} from './discount-threshold';

describe('isDisplayableDiscountPercent', () => {
  it('uses the same per-surface thresholds as the web', () => {
    // Web: kart ve paket `> 3`, ürün detayı `> 0` (fd30ed0a6).
    expect(DISCOUNT_DISPLAY_THRESHOLDS).toEqual({ bundle: 3, card: 3, detail: 0 });
  });

  it.each(['card', 'bundle'] as const)('treats 3%% or less as no discount on the %s surface', (surface) => {
    expect(isDisplayableDiscountPercent(0, surface)).toBe(false);
    expect(isDisplayableDiscountPercent(2, surface)).toBe(false);
    expect(isDisplayableDiscountPercent(3, surface)).toBe(false);
  });

  it.each(['card', 'bundle'] as const)('shows anything above 3%% as a discount on the %s surface', (surface) => {
    expect(isDisplayableDiscountPercent(3.5, surface)).toBe(true);
    expect(isDisplayableDiscountPercent(4, surface)).toBe(true);
    expect(isDisplayableDiscountPercent(20, surface)).toBe(true);
  });

  // HMA-73 (web fd30ed0a6): detayda %1–3'lük indirim de indirim olarak çizilir.
  it('shows every positive discount on the product detail surface', () => {
    expect(isDisplayableDiscountPercent(1, 'detail')).toBe(true);
    expect(isDisplayableDiscountPercent(2, 'detail')).toBe(true);
    expect(isDisplayableDiscountPercent(3, 'detail')).toBe(true);
    expect(isDisplayableDiscountPercent(0, 'detail')).toBe(false);
    expect(isDisplayableDiscountPercent(-5, 'detail')).toBe(false);
  });

  it.each(['card', 'bundle', 'detail'] as const)('rejects missing or malformed values on the %s surface', (surface) => {
    expect(isDisplayableDiscountPercent(undefined, surface)).toBe(false);
    expect(isDisplayableDiscountPercent(null, surface)).toBe(false);
    expect(isDisplayableDiscountPercent(Number.NaN, surface)).toBe(false);
    expect(isDisplayableDiscountPercent(Number.POSITIVE_INFINITY, surface)).toBe(false);
  });
});

describe('getDiscountPercent', () => {
  it('rounds the drop from the previous price to a whole percentage', () => {
    expect(getDiscountPercent(500, 400)).toBe(20);
    expect(getDiscountPercent(339.98, 299.98)).toBe(12);
  });

  it('is zero when there is no real drop', () => {
    expect(getDiscountPercent(400, 400)).toBe(0);
    expect(getDiscountPercent(300, 400)).toBe(0);
    expect(getDiscountPercent(0, 400)).toBe(0);
    expect(getDiscountPercent(Number.NaN, 400)).toBe(0);
  });
});
