import { isProductCodeBadgeVisible, PRODUCT_CODE_BADGE_OFFSET } from './product-code-badge';

describe('isProductCodeBadgeVisible', () => {
  const HEIGHT = 600;

  it('is hidden before the carousel has been measured', () => {
    expect(isProductCodeBadgeVisible(0, 0)).toBe(false);
  });

  it('is visible at the top of the screen (no scroll)', () => {
    expect(isProductCodeBadgeVisible(HEIGHT, 0)).toBe(true);
  });

  it('stays visible while the carousel bottom is still below the badge anchor', () => {
    expect(isProductCodeBadgeVisible(HEIGHT, HEIGHT - PRODUCT_CODE_BADGE_OFFSET - 1)).toBe(true);
  });

  it('hides once the carousel bottom (red line) reaches the badge anchor', () => {
    expect(isProductCodeBadgeVisible(HEIGHT, HEIGHT - PRODUCT_CODE_BADGE_OFFSET)).toBe(false);
  });

  it('stays hidden after the carousel has scrolled fully off screen', () => {
    expect(isProductCodeBadgeVisible(HEIGHT, HEIGHT + 200)).toBe(false);
  });

  it('respects a custom offset', () => {
    expect(isProductCodeBadgeVisible(HEIGHT, HEIGHT - 30, 20)).toBe(true);
    expect(isProductCodeBadgeVisible(HEIGHT, HEIGHT - 10, 20)).toBe(false);
  });
});
