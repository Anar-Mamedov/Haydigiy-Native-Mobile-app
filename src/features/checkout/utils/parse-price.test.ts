import { parsePrice } from './parse-price';

describe('parsePrice', () => {
  it('parses Turkish thousands + decimal format', () => {
    expect(parsePrice('1.234,56')).toBeCloseTo(1234.56);
  });

  it('parses a decimal comma', () => {
    expect(parsePrice('49,90')).toBeCloseTo(49.9);
  });

  it('parses English decimal format', () => {
    expect(parsePrice('169.98')).toBeCloseTo(169.98);
  });

  it('treats multiple dots as Turkish thousands separators', () => {
    expect(parsePrice('1.234.567')).toBe(1234567);
  });

  it('returns numbers unchanged and falls back to 0', () => {
    expect(parsePrice(42)).toBe(42);
    expect(parsePrice('')).toBe(0);
    expect(parsePrice(null)).toBe(0);
    expect(parsePrice('abc')).toBe(0);
  });
});
