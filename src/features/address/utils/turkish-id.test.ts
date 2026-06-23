import { isValidTurkishId } from './turkish-id';

describe('isValidTurkishId', () => {
  it('accepts a checksum-valid 11-digit number', () => {
    expect(isValidTurkishId('10000000146')).toBe(true);
    expect(isValidTurkishId('10000000078')).toBe(true);
  });

  it('rejects numbers that fail the checksum', () => {
    expect(isValidTurkishId('12345678901')).toBe(false);
    expect(isValidTurkishId('10000000147')).toBe(false);
  });

  it('rejects a leading zero', () => {
    expect(isValidTurkishId('01234567890')).toBe(false);
  });

  it('rejects wrong lengths and non-numeric input', () => {
    expect(isValidTurkishId('1000000014')).toBe(false);
    expect(isValidTurkishId('100000001466')).toBe(false);
    expect(isValidTurkishId('')).toBe(false);
    expect(isValidTurkishId('1000000014a')).toBe(false);
  });
});
