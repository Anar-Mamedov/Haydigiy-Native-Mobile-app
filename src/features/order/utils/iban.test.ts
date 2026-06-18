import { formatIbanInput, getIbanDigits, isValidIban, normalizeIban } from './iban';

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
