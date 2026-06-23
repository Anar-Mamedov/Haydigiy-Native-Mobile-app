import {
  formatIbanInput,
  getIbanDigits,
  isValidIban,
  isValidTurkishIban,
  normalizeIban,
} from './iban';

describe('getIbanDigits', () => {
  it('strips non-digits and caps at 24', () => {
    expect(getIbanDigits('TR12 3456')).toBe('123456');
    expect(getIbanDigits('1'.repeat(40))).toHaveLength(24);
  });
});

describe('formatIbanInput', () => {
  it('groups into blocks of four with the TR prefix', () => {
    expect(formatIbanInput('1234567890')).toBe('TR12 3456 7890');
    expect(formatIbanInput('')).toBe('TR');
  });
});

describe('normalizeIban', () => {
  it('prefixes TR and keeps only the digits', () => {
    expect(normalizeIban('TR12 3456 abc')).toBe('TR123456');
  });
});

describe('isValidIban', () => {
  it('requires exactly 24 digits', () => {
    expect(isValidIban('1'.repeat(24))).toBe(true);
    expect(isValidIban('1'.repeat(23))).toBe(false);
  });
});

describe('isValidTurkishIban', () => {
  it('accepts checksum-valid Turkish IBANs', () => {
    expect(isValidTurkishIban('TR33 0006 1005 1978 6457 8413 26')).toBe(true);
    expect(isValidTurkishIban('TR320010009999901234567890')).toBe(true);
  });

  it('rejects wrong length or checksum', () => {
    expect(isValidTurkishIban('TR00 0000 0000 0000 0000 0000 00')).toBe(false);
    expect(isValidTurkishIban('1'.repeat(24))).toBe(false); // 24 digits but checksum fails
    expect(isValidTurkishIban('TR12 3456')).toBe(false); // too short
  });
});
