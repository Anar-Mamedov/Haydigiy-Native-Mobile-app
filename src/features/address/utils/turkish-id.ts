/**
 * Validates a Turkish national identity number (T.C. Kimlik No) using the
 * official checksum rules, mirroring the web `isValidTc` implementation:
 * 11 digits, first digit non-zero, and the 10th/11th digits are checksums.
 */
export function isValidTurkishId(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;

  const digits = value.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = (sumOdd * 7 - sumEven) % 10;
  const eleventh = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0) % 10;

  return digits[9] === tenth && digits[10] === eleventh;
}
