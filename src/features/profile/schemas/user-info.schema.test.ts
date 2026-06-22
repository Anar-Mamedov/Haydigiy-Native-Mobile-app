import { userInfoSchema } from './user-info.schema';

const valid = {
  name: 'Anar',
  surname: 'Mamedov',
  email: 'anar@example.com',
  phone: '5551234567',
  gender: 'male',
  day: '08',
  month: '05',
  year: '1990',
};

describe('userInfoSchema', () => {
  it('accepts a fully valid profile', () => {
    expect(userInfoSchema.safeParse(valid).success).toBe(true);
  });

  it('treats an empty phone as valid (optional)', () => {
    expect(userInfoSchema.safeParse({ ...valid, phone: '' }).success).toBe(true);
  });

  it('rejects short names, invalid e-mail and invalid phone', () => {
    expect(userInfoSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, surname: '' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false);
  });
});
