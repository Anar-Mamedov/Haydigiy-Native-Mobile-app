const IBAN_DIGIT_COUNT = 24;
const IBAN_FULL_LENGTH = 26; // "TR" + 24 digits

/** Keeps only digits after the `TR` prefix, capped at the 24 IBAN digits. */
export function getIbanDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, IBAN_DIGIT_COUNT);
}

/** Formats raw digits into a grouped `TR00 0000 ...` display string. */
export function formatIbanInput(digits: string): string {
  const full = `TR${digits}`;
  return full.match(/.{1,4}/g)?.join(' ') ?? 'TR';
}

/** Normalizes any user input to the canonical `TR` + 24-digit IBAN. */
export function normalizeIban(value: string): string {
  return `TR${getIbanDigits(value)}`;
}

/** True when the input holds a complete 24-digit IBAN body. */
export function isValidIban(value: string): boolean {
  return getIbanDigits(value).length === IBAN_DIGIT_COUNT;
}

/**
 * Strict Turkish IBAN validation using the ISO 7064 MOD-97 checksum, mirroring
 * the web payment-method modal: `TR` + 24 digits (26 chars total) whose
 * rearranged numeric form is congruent to 1 mod 97.
 */
export function isValidTurkishIban(value: string): boolean {
  const normalized = normalizeIban(value);
  if (normalized.length !== IBAN_FULL_LENGTH) return false;

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join('');

  try {
    return BigInt(numeric) % 97n === 1n;
  } catch {
    return false;
  }
}
