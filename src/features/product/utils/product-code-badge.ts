/** Vertical gap (px) below the header where the pinned product-code badge sits. */
export const PRODUCT_CODE_BADGE_OFFSET = 10;

/**
 * Mirrors the web `isCarouselVisible` logic: the pinned product-code badge
 * stays visible while the image carousel is still on screen, i.e. while the
 * carousel's bottom edge has not yet scrolled up past the badge anchor.
 *
 * Because the carousel is the first item in the scroll content, its bottom edge
 * sits at `carouselHeight` in content space and at `carouselHeight - scrollY`
 * relative to the scroll viewport top. Once that drops to the badge offset, the
 * carousel (red line) has reached the badge and it should disappear with it.
 *
 * @param carouselHeight measured height of the carousel block (0 until laid out)
 * @param scrollY current vertical scroll offset of the product ScrollView
 */
export function isProductCodeBadgeVisible(
  carouselHeight: number,
  scrollY: number,
  offset: number = PRODUCT_CODE_BADGE_OFFSET,
): boolean {
  if (carouselHeight <= 0) return false;
  return carouselHeight - scrollY > offset;
}
