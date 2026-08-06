import { clampFontScale, COMPACT_MAX_FONT_SCALE, MAX_FONT_SCALE } from './font-scale';

describe('clampFontScale', () => {
  it('leaves the default text size untouched', () => {
    expect(clampFontScale(1)).toBe(1);
  });

  it('never shrinks text below the design size', () => {
    expect(clampFontScale(0.85)).toBe(1);
  });

  it('passes through settings inside the allowed range', () => {
    expect(clampFontScale(1.15)).toBe(1.15);
    expect(clampFontScale(MAX_FONT_SCALE)).toBe(MAX_FONT_SCALE);
  });

  it('caps the accessibility text sizes that break the layout', () => {
    expect(clampFontScale(2)).toBe(MAX_FONT_SCALE);
    expect(clampFontScale(3.1)).toBe(MAX_FONT_SCALE);
  });

  it('applies the tighter cap on constrained surfaces', () => {
    expect(clampFontScale(2, COMPACT_MAX_FONT_SCALE)).toBe(COMPACT_MAX_FONT_SCALE);
    expect(clampFontScale(1.1, COMPACT_MAX_FONT_SCALE)).toBe(1.1);
  });

  it('falls back to 1 for a missing or malformed scale', () => {
    expect(clampFontScale(Number.NaN)).toBe(1);
    expect(clampFontScale(Number.POSITIVE_INFINITY)).toBe(1);
  });

  it('keeps the compact cap below the global one', () => {
    expect(COMPACT_MAX_FONT_SCALE).toBeLessThan(MAX_FONT_SCALE);
  });
});
