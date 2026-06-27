/**
 * Single source of truth for the product carousel geometry, so the screen can
 * derive the image height deterministically (without relying on `onLayout`)
 * to drive the pinned product-code badge visibility.
 */

/** Horizontal padding (px) applied on each side of the carousel. */
export const CAROUSEL_HORIZONTAL_PADDING = 32;

/** Image aspect ratio expressed as height / width (2:3 portrait). */
export const CAROUSEL_ASPECT_RATIO = 1.5;

/** Width of a single carousel item for the given screen width. */
export function getCarouselItemWidth(screenWidth: number): number {
  return Math.max(screenWidth - CAROUSEL_HORIZONTAL_PADDING * 2, 1);
}

/** Rendered height of the carousel image area for the given screen width. */
export function getCarouselImageHeight(screenWidth: number): number {
  return getCarouselItemWidth(screenWidth) * CAROUSEL_ASPECT_RATIO;
}
