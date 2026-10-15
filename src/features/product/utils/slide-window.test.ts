import { isSlideInWindow } from './slide-window';

const windowOf = (activeIndex: number, count: number, radius?: number) =>
  Array.from({ length: count }, (_, index) => index).filter((index) =>
    isSlideInWindow(index, activeIndex, count, radius),
  );

describe('isSlideInWindow', () => {
  it('keeps the active slide and its neighbours', () => {
    expect(windowOf(3, 8)).toEqual([2, 3, 4]);
  });

  it('wraps around both ends so autoplay can loop back', () => {
    expect(windowOf(0, 8)).toEqual([0, 1, 7]);
    expect(windowOf(7, 8)).toEqual([0, 6, 7]);
  });

  it('mounts every slide when the slider is shorter than the window', () => {
    expect(windowOf(0, 2)).toEqual([0, 1]);
    expect(windowOf(1, 3)).toEqual([0, 1, 2]);
  });

  it('honours a custom radius', () => {
    expect(windowOf(4, 10, 0)).toEqual([4]);
    expect(windowOf(4, 10, 2)).toEqual([2, 3, 4, 5, 6]);
  });

  it('rejects out-of-range indexes and empty sliders', () => {
    expect(isSlideInWindow(-1, 0, 5)).toBe(false);
    expect(isSlideInWindow(5, 0, 5)).toBe(false);
    expect(isSlideInWindow(0, 0, 0)).toBe(false);
  });
});
