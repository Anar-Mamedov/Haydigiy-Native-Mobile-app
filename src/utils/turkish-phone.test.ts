import {
  extractTurkishNationalNumber,
  formatTurkishPhoneDisplay,
  isValidTurkishMobile,
  sanitizeTurkishMobileInput,
} from '@/utils/turkish-phone';

describe('turkish-phone utils', () => {
  describe('extractTurkishNationalNumber', () => {
    it('strips non-digit characters', () => {
      expect(extractTurkishNationalNumber('0532 123 45 67')).toBe('5321234567');
    });

    it('drops the leading zero', () => {
      expect(extractTurkishNationalNumber('05321234567')).toBe('5321234567');
    });

    it('drops the +90 / 0090 / 90 country codes', () => {
      expect(extractTurkishNationalNumber('+90 532 123 45 67')).toBe('5321234567');
      expect(extractTurkishNationalNumber('00905321234567')).toBe('5321234567');
      expect(extractTurkishNationalNumber('905321234567')).toBe('5321234567');
    });

    it('ignores letters entirely', () => {
      expect(extractTurkishNationalNumber('arstarst')).toBe('');
    });

    it('never exceeds 10 digits', () => {
      expect(extractTurkishNationalNumber('053212345679999')).toBe('5321234567');
    });
  });

  describe('formatTurkishPhoneDisplay', () => {
    it('formats a complete national number with the leading zero', () => {
      expect(formatTurkishPhoneDisplay('5321234567')).toBe('0532 123 45 67');
    });

    it('formats partial input progressively', () => {
      expect(formatTurkishPhoneDisplay('5')).toBe('05');
      expect(formatTurkishPhoneDisplay('532')).toBe('0532');
      expect(formatTurkishPhoneDisplay('53212')).toBe('0532 12');
    });

    it('returns an empty string for empty or letter-only input', () => {
      expect(formatTurkishPhoneDisplay('')).toBe('');
      expect(formatTurkishPhoneDisplay('abc')).toBe('');
    });
  });

  describe('sanitizeTurkishMobileInput', () => {
    it('accepts digits that start with 5', () => {
      expect(sanitizeTurkishMobileInput('5')).toBe('5');
      expect(sanitizeTurkishMobileInput('0532 123 45 67')).toBe('5321234567');
    });

    it('blocks a first digit other than 5', () => {
      expect(sanitizeTurkishMobileInput('0')).toBe('');
      expect(sanitizeTurkishMobileInput('01')).toBe('');
      expect(sanitizeTurkishMobileInput('0230 957 20 93')).toBe('');
    });

    it('ignores letters', () => {
      expect(sanitizeTurkishMobileInput('abc')).toBe('');
    });
  });

  describe('isValidTurkishMobile', () => {
    it('accepts a complete number starting with 5', () => {
      expect(isValidTurkishMobile('5321234567')).toBe(true);
      expect(isValidTurkishMobile('0532 123 45 67')).toBe(true);
    });

    it('rejects numbers not starting with 5', () => {
      expect(isValidTurkishMobile('4321234567')).toBe(false);
    });

    it('rejects incomplete numbers', () => {
      expect(isValidTurkishMobile('532123')).toBe(false);
    });

    it('rejects non-numeric input', () => {
      expect(isValidTurkishMobile('arstarst')).toBe(false);
    });
  });
});
