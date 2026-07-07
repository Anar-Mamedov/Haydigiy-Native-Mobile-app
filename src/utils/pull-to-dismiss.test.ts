import {
  getPullDownDistance,
  getPullDownOpacity,
  isScrollAtTop,
  PULL_TO_DISMISS_DISTANCE,
  PULL_TO_DISMISS_FADE_DISTANCE,
  PULL_TO_DISMISS_FLING_MIN_DISTANCE,
  PULL_TO_DISMISS_FLING_VELOCITY,
  PULL_TO_DISMISS_MIN_DRAG_OPACITY,
  PULL_TO_DISMISS_TOP_TOLERANCE,
  shouldDismissOnPullRelease,
} from './pull-to-dismiss';

describe('isScrollAtTop', () => {
  it('treats offsets within the tolerance as top', () => {
    expect(isScrollAtTop(0)).toBe(true);
    expect(isScrollAtTop(PULL_TO_DISMISS_TOP_TOLERANCE)).toBe(true);
  });

  it('treats negative offsets (overscroll) as top', () => {
    expect(isScrollAtTop(-12)).toBe(true);
  });

  it('rejects offsets beyond the tolerance', () => {
    expect(isScrollAtTop(PULL_TO_DISMISS_TOP_TOLERANCE + 1)).toBe(false);
    expect(isScrollAtTop(320)).toBe(false);
  });
});

describe('getPullDownDistance', () => {
  it('measures the pull relative to the engagement anchor', () => {
    expect(getPullDownDistance(120, 20)).toBe(100);
  });

  it('never returns a negative pull (dragging back up past the anchor)', () => {
    expect(getPullDownDistance(10, 40)).toBe(0);
  });

  it('starts from zero when the anchor matches the current translation', () => {
    expect(getPullDownDistance(35, 35)).toBe(0);
  });
});

describe('getPullDownOpacity', () => {
  it('keeps full opacity while the content is not pulled', () => {
    expect(getPullDownOpacity(0)).toBe(1);
  });

  it('fades gradually as the pull grows', () => {
    const quarterFade = getPullDownOpacity(PULL_TO_DISMISS_FADE_DISTANCE / 4);
    expect(quarterFade).toBeCloseTo(0.75);
    expect(getPullDownOpacity(PULL_TO_DISMISS_DISTANCE)).toBeLessThan(1);
    expect(getPullDownOpacity(PULL_TO_DISMISS_DISTANCE)).toBeGreaterThan(
      PULL_TO_DISMISS_MIN_DRAG_OPACITY,
    );
  });

  it('never fades below the drag floor while the finger is down', () => {
    expect(getPullDownOpacity(PULL_TO_DISMISS_FADE_DISTANCE * 3)).toBe(
      PULL_TO_DISMISS_MIN_DRAG_OPACITY,
    );
  });

  it('never exceeds full opacity for negative pulls', () => {
    expect(getPullDownOpacity(-50)).toBe(1);
  });
});

describe('shouldDismissOnPullRelease', () => {
  it('dismisses once the pull reaches the distance threshold', () => {
    expect(shouldDismissOnPullRelease(PULL_TO_DISMISS_DISTANCE, 0)).toBe(true);
    expect(shouldDismissOnPullRelease(PULL_TO_DISMISS_DISTANCE + 40, 0)).toBe(true);
  });

  it('keeps the screen when released below the threshold without a fling', () => {
    expect(shouldDismissOnPullRelease(PULL_TO_DISMISS_DISTANCE - 1, 0)).toBe(false);
    expect(shouldDismissOnPullRelease(0, 0)).toBe(false);
  });

  it('dismisses on a fast downward fling past the minimum distance', () => {
    expect(
      shouldDismissOnPullRelease(PULL_TO_DISMISS_FLING_MIN_DISTANCE, PULL_TO_DISMISS_FLING_VELOCITY),
    ).toBe(true);
  });

  it('ignores a fast fling that has barely moved', () => {
    expect(
      shouldDismissOnPullRelease(
        PULL_TO_DISMISS_FLING_MIN_DISTANCE - 1,
        PULL_TO_DISMISS_FLING_VELOCITY * 2,
      ),
    ).toBe(false);
  });

  it('ignores upward velocity on release', () => {
    expect(shouldDismissOnPullRelease(PULL_TO_DISMISS_FLING_MIN_DISTANCE, -2000)).toBe(false);
  });

  it('honours a custom dismiss distance', () => {
    expect(shouldDismissOnPullRelease(80, 0, 80)).toBe(true);
    expect(shouldDismissOnPullRelease(79, 0, 80)).toBe(false);
  });
});
