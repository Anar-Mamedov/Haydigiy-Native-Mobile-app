import { paymentMethodSchema } from './payment-method.schema';

const valid = {
  // 24 IBAN digits (TR33 0006 1005 1978 6457 8413 26) without the TR prefix.
  iban: '330006100519786457841326',
  ibanName: 'Anar Mamedov',
  isDefault: true,
};

describe('paymentMethodSchema', () => {
  it('accepts a checksum-valid IBAN with a full name', () => {
    expect(paymentMethodSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty or checksum-invalid IBAN', () => {
    expect(paymentMethodSchema.safeParse({ ...valid, iban: '' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ ...valid, iban: '1'.repeat(24) }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ ...valid, iban: '123' }).success).toBe(false);
  });

  it('requires a first and last name (at least two words)', () => {
    expect(paymentMethodSchema.safeParse({ ...valid, ibanName: '' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ ...valid, ibanName: 'Anar' }).success).toBe(false);
    expect(paymentMethodSchema.safeParse({ ...valid, ibanName: 'Anar Mamedov' }).success).toBe(
      true,
    );
  });
});
