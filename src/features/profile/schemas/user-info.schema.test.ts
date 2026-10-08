import {
  BIRTH_DATE_INCOMPLETE_MESSAGE,
  GENDER_OPTIONS,
  userInfoSchema,
} from './user-info.schema';

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

  it('treats an empty e-mail as valid, like the web profile form', () => {
    // Regression: accounts registered with a phone have no e-mail, and the form
    // used to block saving until one was typed.
    expect(userInfoSchema.safeParse({ ...valid, email: '' }).success).toBe(true);
    expect(userInfoSchema.safeParse({ ...valid, email: '   ' }).success).toBe(true);
  });

  it('offers the same three genders as the web form', () => {
    expect(GENDER_OPTIONS.map((option) => option.value)).toEqual(['male', 'female', 'other']);
    expect(GENDER_OPTIONS.map((option) => option.label)).toEqual(['Erkek', 'Kadın', 'Diğer']);
  });

  it('accepts a fully cleared birth date and gender (sent as null)', () => {
    expect(userInfoSchema.safeParse({ ...valid, day: '', gender: '', month: '', year: '' }).success).toBe(true);
  });

  it('rejects a half-cleared birth date so it cannot wipe the saved one by accident', () => {
    const result = userInfoSchema.safeParse({ ...valid, day: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      message: BIRTH_DATE_INCOMPLETE_MESSAGE,
      path: ['day'],
    });
  });

  describe('minimum age (16, like the web form)', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 9, 8));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('accepts a birth date exactly 16 years ago', () => {
      expect(
        userInfoSchema.safeParse({ ...valid, day: '08', month: '10', year: '2010' }).success,
      ).toBe(true);
    });

    // Web paritesi: 16 yaşı seçim listeleri uygular; eski kuralla (8 yaş) kaydedilmiş
    // bir tarih web'de olduğu gibi geri gönderildiği için kaydı engellemez.
    it('does not block a date saved under the old 8-year rule', () => {
      expect(
        userInfoSchema.safeParse({ ...valid, day: '01', month: '01', year: '2012' }).success,
      ).toBe(true);
    });

    it('still lets the user clear the whole birth date', () => {
      expect(userInfoSchema.safeParse({ ...valid, day: '', month: '', year: '' }).success).toBe(true);
    });

    it('reports a half-cleared date as incomplete, not as too young', () => {
      const result = userInfoSchema.safeParse({ ...valid, day: '', month: '10', year: '2018' });

      expect(result.error?.issues).toHaveLength(1);
      expect(result.error?.issues[0]?.message).toBe(BIRTH_DATE_INCOMPLETE_MESSAGE);
    });
  });

  it('explains a malformed e-mail in Turkish', () => {
    const result = userInfoSchema.safeParse({ ...valid, email: 'anar@' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Geçerli bir e-posta adresi giriniz');
  });

  it('rejects short names, invalid e-mail and invalid phone', () => {
    expect(userInfoSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, surname: '' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
    expect(userInfoSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false);
  });
});
