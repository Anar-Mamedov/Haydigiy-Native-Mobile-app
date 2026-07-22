export const HOME_BANNER_SWIPE_VELOCITY = 700;

export function getHomeBannerSwipeThreshold(viewportWidth: number): number {
  'worklet';

  return Math.min(96, Math.max(64, viewportWidth * 0.22));
}

export function shouldDismissHomeBanner(
  translationX: number,
  velocityX: number,
  viewportWidth: number,
): boolean {
  'worklet';

  return (
    Math.abs(translationX) >= getHomeBannerSwipeThreshold(viewportWidth) ||
    Math.abs(velocityX) >= HOME_BANNER_SWIPE_VELOCITY
  );
}
