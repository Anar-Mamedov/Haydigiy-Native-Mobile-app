import { extractProductCode } from './extract-product-code';

describe('extractProductCode', () => {
  it('extracts the trailing code from a standard product name', () => {
    expect(extractProductCode('Spor Ayakkabı Siyah - 31678.264.')).toBe('31678.264.');
  });

  it('uses the last separator when the name itself contains " - "', () => {
    expect(extractProductCode('Kimono Takım - Bordo - 42112.1247.')).toBe('42112.1247.');
  });

  it('trims surrounding whitespace from the extracted code', () => {
    expect(extractProductCode('Tişört Beyaz -  ABC.123 ')).toBe('ABC.123');
  });

  it('returns undefined when there is no code segment', () => {
    expect(extractProductCode('Spor Ayakkabı Siyah')).toBeUndefined();
  });

  it('returns undefined for an empty trailing segment', () => {
    expect(extractProductCode('Spor Ayakkabı Siyah - ')).toBeUndefined();
  });

  it('returns undefined for empty or nullish input', () => {
    expect(extractProductCode('')).toBeUndefined();
    expect(extractProductCode(null)).toBeUndefined();
    expect(extractProductCode(undefined)).toBeUndefined();
  });
});
