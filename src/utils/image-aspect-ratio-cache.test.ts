import { createAspectRatioCache } from './image-aspect-ratio-cache';

describe('createAspectRatioCache', () => {
  it('stores and returns ratios by key', () => {
    const cache = createAspectRatioCache();
    cache.set('a', 1.5);

    expect(cache.get('a')).toBe(1.5);
    expect(cache.get('b')).toBeUndefined();
  });

  it('ignores invalid ratios and empty keys', () => {
    const cache = createAspectRatioCache();
    cache.set('a', 0);
    cache.set('b', Number.NaN);
    cache.set('c', Number.POSITIVE_INFINITY);
    cache.set('', 2);

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeUndefined();
    expect(cache.get('')).toBeUndefined();
  });

  it('evicts the least recently written entry when full', () => {
    const cache = createAspectRatioCache(2);
    cache.set('a', 1);
    cache.set('b', 2);
    // Rewriting `a` makes `b` the oldest entry.
    cache.set('a', 1.1);
    cache.set('c', 3);

    expect(cache.get('a')).toBe(1.1);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });
});
