import {
  getHomeBannerSwipeThreshold,
  shouldDismissHomeBanner,
} from './home-banner-swipe';

describe('home update banner swipe', () => {
  it('dismisses after enough movement in either horizontal direction', () => {
    const threshold = getHomeBannerSwipeThreshold(390);

    expect(shouldDismissHomeBanner(threshold, 0, 390)).toBe(true);
    expect(shouldDismissHomeBanner(-threshold, 0, 390)).toBe(true);
  });

  it('dismisses a fast horizontal flick in either direction', () => {
    expect(shouldDismissHomeBanner(20, 800, 390)).toBe(true);
    expect(shouldDismissHomeBanner(-20, -800, 390)).toBe(true);
  });

  it('keeps the banner when movement and velocity stay below their thresholds', () => {
    expect(shouldDismissHomeBanner(20, 200, 390)).toBe(false);
  });
});
