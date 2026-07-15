import {
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
  registerSchema,
  fastLoginSchema,
  otpSchema,
} from '@/features/auth/schemas/auth.schema';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('passes with valid email and password', () => {
      const result = loginSchema.safeParse({
        identifier: 'anar@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('passes with valid Turkish phone number and password', () => {
      const result = loginSchema.safeParse({
        identifier: '5551234567',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('fails with invalid email', () => {
      const result = loginSchema.safeParse({
        identifier: 'invalidemail.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Geçerli bir e-posta adresi giriniz.');
      }
    });

    it('fails with invalid phone number format', () => {
      const result = loginSchema.safeParse({
        identifier: '05551234567', // starts with 0 (fails)
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Geçerli bir telefon numarası giriniz (5xxxxxxxxx).');
      }
    });

    it('fails with short password', () => {
      const result = loginSchema.safeParse({
        identifier: 'anar@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts matching passwords supported by the API', () => {
      expect(
        resetPasswordSchema.safeParse({
          newPassword: 'secret1',
          confirmPassword: 'secret1',
        }).success,
      ).toBe(true);
    });

    it('rejects short and mismatched passwords', () => {
      const shortPassword = resetPasswordSchema.safeParse({
        newPassword: '12345',
        confirmPassword: '12345',
      });
      const mismatchedPassword = resetPasswordSchema.safeParse({
        newPassword: 'secret1',
        confirmPassword: 'secret2',
      });

      expect(shortPassword.success).toBe(false);
      expect(mismatchedPassword.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      name: 'Anar',
      surname: 'Mamedov',
      phone: '5551234567',
      password: 'password123',
      kvkk: true,
      commercial: true,
    };

    it('passes with valid inputs', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('fails if name or surname is too short', () => {
      const result = registerSchema.safeParse({
        ...validData,
        name: 'A',
      });
      expect(result.success).toBe(false);
    });

    it('fails if phone number is not valid', () => {
      const result = registerSchema.safeParse({
        ...validData,
        phone: '1234567890',
      });
      expect(result.success).toBe(false);
    });

    it('fails if KVKK consent is not approved', () => {
      const result = registerSchema.safeParse({
        ...validData,
        kvkk: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('fastLoginSchema', () => {
    it('passes with a valid national phone number', () => {
      const result = fastLoginSchema.safeParse({
        phone: '5551234567',
      });
      expect(result.success).toBe(true);
    });

    it('passes when the phone is entered with the leading 0', () => {
      const result = fastLoginSchema.safeParse({
        phone: '05551234567',
      });
      expect(result.success).toBe(true);
    });

    it('passes when the phone is formatted with spaces', () => {
      const result = fastLoginSchema.safeParse({
        phone: '0555 123 45 67',
      });
      expect(result.success).toBe(true);
    });

    it('rejects email addresses', () => {
      const result = fastLoginSchema.safeParse({
        phone: 'test@example.com',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Geçerli bir telefon numarası giriniz (05XX XXX XX XX).');
      }
    });

    it('rejects numbers that do not start with 5', () => {
      const result = fastLoginSchema.safeParse({
        phone: '04441234567',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Geçerli bir telefon numarası giriniz (05XX XXX XX XX).');
      }
    });

    it('rejects incomplete phone numbers', () => {
      const result = fastLoginSchema.safeParse({
        phone: '0555 123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('otpSchema', () => {
    it('passes with 6-digit numeric string', () => {
      const result = otpSchema.safeParse({
        code: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('fails if code is too short or long', () => {
      const resultShort = otpSchema.safeParse({ code: '12345' });
      const resultLong = otpSchema.safeParse({ code: '1234567' });
      expect(resultShort.success).toBe(false);
      expect(resultLong.success).toBe(false);
    });

    it('fails if code contains non-numeric chars', () => {
      const result = otpSchema.safeParse({
        code: '12345a',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts a valid e-mail address', () => {
      expect(forgotPasswordSchema.safeParse({ identifier: 'user@example.com' }).success).toBe(true);
    });

    it('accepts a valid Turkish mobile number', () => {
      expect(forgotPasswordSchema.safeParse({ identifier: '5321234567' }).success).toBe(true);
    });

    it('rejects an invalid reset identifier', () => {
      expect(forgotPasswordSchema.safeParse({ identifier: 'not-an-identifier' }).success).toBe(false);
    });
  });
});
