import { changePasswordSchema } from './change-password.schema';

const valid = { newPassword: 'Abcdef12', confirmPassword: 'Abcdef12' };

describe('changePasswordSchema', () => {
  it('accepts a strong, matching password', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects passwords missing complexity requirements', () => {
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: 'abcdef12', confirmPassword: 'abcdef12' }).success).toBe(false); // no uppercase
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: 'ABCDEF12', confirmPassword: 'ABCDEF12' }).success).toBe(false); // no lowercase
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: 'Abcdefgh', confirmPassword: 'Abcdefgh' }).success).toBe(false); // no digit
    expect(changePasswordSchema.safeParse({ ...valid, newPassword: 'Abc12', confirmPassword: 'Abc12' }).success).toBe(false); // too short
  });

  it('rejects when the confirmation does not match', () => {
    const result = changePasswordSchema.safeParse({ newPassword: 'Abcdef12', confirmPassword: 'Abcdef99' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword');
    }
  });
});
