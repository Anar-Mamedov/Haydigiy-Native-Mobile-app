const IBAN_DIGIT_COUNT = 24;

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
