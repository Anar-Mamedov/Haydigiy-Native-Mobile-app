/**
 * Turkish mobile phone helpers.
 *
 * Domain model: the "national number" is the 10-digit mobile number without the
 * leading zero and always starts with 5 (e.g. "5321234567").
 * Display format adds the Turkish leading zero: "0532 123 45 67".
 */

const NATIONAL_NUMBER_LENGTH = 10;
const DISPLAY_GROUPS = [3, 3, 2, 2] as const;

/**
 * Extracts the 10-digit national mobile number from arbitrary user input.
 * Strips non-digits, country codes (+90, 0090, 90) and the leading zero.
 * The result never exceeds 10 digits.
 */
export function extractTurkishNationalNumber(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('0090')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('90') && digits.length > NATIONAL_NUMBER_LENGTH) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, NATIONAL_NUMBER_LENGTH);
}

/**
 * Formats a national number for display with the Turkish leading zero,
 * e.g. "5321234567" -> "0532 123 45 67". Returns "" for empty input.
 */
export function formatTurkishPhoneDisplay(value: string): string {
  const digits = extractTurkishNationalNumber(value);
  if (!digits) return '';

  const parts: string[] = [];
  let index = 0;
  for (const size of DISPLAY_GROUPS) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }

  return `0${parts.join(' ')}`;
}

/**
 * Sanitizes raw text-field input into a partial national number that always
 * starts with 5. Used while typing so the field can never build a number with
 * the wrong prefix (e.g. "01..." / "02..."): the first digit must be 5,
 * otherwise nothing is accepted.
 */
export function sanitizeTurkishMobileInput(value: string): string {
  const national = extractTurkishNationalNumber(value);
  if (national && national[0] !== '5') {
    return '';
  }
  return national;
}

/**
 * Validates that the input resolves to a complete Turkish mobile number:
 * exactly 10 national digits starting with 5.
 */
export function isValidTurkishMobile(value: string): boolean {
  return /^5\d{9}$/.test(extractTurkishNationalNumber(value));
}
