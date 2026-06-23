/**
 * Company bank-transfer details shown on the "Banka Hesabımız" screen. Static
 * informational content (no API), mirroring the web `BankAccountDetails`. Kept in
 * one place so the values have a single source of truth.
 */
export type BankAccountField = {
  label: string;
  value: string;
  /**
   * When set, the row is tappable and copies this string to the clipboard
   * (e.g. the spaceless IBAN, ready to paste into a bank form). Falls back to
   * `value` when omitted.
   */
  copyable?: boolean;
  copyValue?: string;
};

export const BANK_ACCOUNT_DETAILS: BankAccountField[] = [
  { label: 'BANKA', value: 'FİNANSBANK' },
  { label: 'HESAP ADI', value: 'HAYDİGİY E-TİCARET TEKS. SAN. VE TİC. LTD. ŞTİ.' },
  {
    label: 'IBAN',
    value: 'TR48 0011 1000 0000 0104 5382 90',
    copyable: true,
    copyValue: 'TR480011100000000104538290',
  },
];
