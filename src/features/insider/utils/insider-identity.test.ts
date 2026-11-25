import {
  hasInsiderIdentifierChanged,
  toE164TurkishPhone,
  toInsiderUserIdentity,
} from './insider-identity';
import { User } from '@/types/auth.types';

const testUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Ayşe',
  surname: 'Yılmaz',
  phoneNumber: '5321234567',
};

/** Insider'ın aynı saydığı yazım farkları pencereyi açmamalı; açarsa kimlik boşuna geri tutulur. */
describe('hasInsiderIdentifierChanged', () => {
  it.each<[string, User, User]>([
    ['e-posta', testUser, { ...testUser, email: 'yeni@example.com' }],
    ['telefon', testUser, { ...testUser, phoneNumber: '5559876543' }],
    ['ilk kez eklenen telefon', { ...testUser, phoneNumber: undefined }, testUser],
  ])('detects a changed %s', (_label, previous, next) => {
    expect(hasInsiderIdentifierChanged(previous, next)).toBe(true);
  });

  it.each([
    ['e-posta harf büyüklüğü', { email: 'User@Example.com' }],
    ['e-posta boşlukları', { email: ' user@example.com ' }],
    ['0 önekli telefon', { phoneNumber: '05321234567' }],
    ['E.164 telefon', { phoneNumber: '+905321234567' }],
    ['ad', { name: 'Ayşe Nur' }],
  ])('ignores a %s change Insider sees as the same value', (_label, change) => {
    expect(hasInsiderIdentifierChanged(testUser, { ...testUser, ...change })).toBe(false);
  });

  it('treats the first identification as a sign-in, not a change', () => {
    expect(hasInsiderIdentifierChanged(null, testUser)).toBe(false);
  });

  describe('with the backend E.164 phone', () => {
    const withE164: User = { ...testUser, phoneE164: '+905321234567' };

    it('ignores a session that gains the field for the same number', () => {
      // Eski oturum (yedek kural) → giriş ya da profil kaydı alanı getirdi: Insider aynı değeri görür.
      expect(hasInsiderIdentifierChanged(testUser, withE164)).toBe(false);
    });

    it('ignores a save whose response drops the field for the same number', () => {
      expect(hasInsiderIdentifierChanged(withE164, { ...withE164, phoneE164: undefined })).toBe(
        false,
      );
    });

    it('detects a changed backend E.164 phone', () => {
      expect(
        hasInsiderIdentifierChanged(withE164, {
          ...withE164,
          phoneNumber: '5559876543',
          phoneE164: '+905559876543',
        }),
      ).toBe(true);
    });

    it('detects a number the fallback rule cannot format but the backend can', () => {
      const foreign: User = { ...testUser, phoneNumber: '4915112345678' };
      expect(
        hasInsiderIdentifierChanged(foreign, { ...foreign, phoneE164: '+4915112345678' }),
      ).toBe(true);
    });
  });
});

describe('toInsiderUserIdentity', () => {
  it('prefers the phone the backend formatted', () => {
    // Kural dışı kayıt: istemci kuralı reddederdi, backend'in değeri gider.
    const user: User = { ...testUser, phoneNumber: '4915112345678', phoneE164: '+4915112345678' };

    expect(toInsiderUserIdentity(user).phone).toBe('+4915112345678');
  });

  it('trims the backend value', () => {
    expect(toInsiderUserIdentity({ ...testUser, phoneE164: ' +905321234567 ' }).phone).toBe(
      '+905321234567',
    );
  });

  it.each<[string, string | null | undefined]>([
    ['alan olmayan eski oturum', undefined],
    ['null dönen alan', null],
    ['boş dönen alan', '  '],
  ])('falls back to the national number for %s', (_label, phoneE164) => {
    expect(toInsiderUserIdentity({ ...testUser, phoneE164 }).phone).toBe('+905321234567');
  });

  it('keeps the e-mail and CRM id rules unchanged', () => {
    expect(toInsiderUserIdentity({ ...testUser, phoneE164: '+905321234567' })).toEqual({
      email: 'user@example.com',
      phone: '+905321234567',
      userId: 'user-1',
    });
  });
});

describe('toE164TurkishPhone', () => {
  it.each([
    ['5321234567', '+905321234567'],
    ['05321234567', '+905321234567'],
    ['+905321234567', '+905321234567'],
    ['0532 123 45 67', '+905321234567'],
    // `+` ile başlayan değer backend formatter'ı gibi `+` ve rakamlarına indirgenir.
    ['+90 555 123 45 67', '+905551234567'],
    [' +90 (555) 123-45-67 ', '+905551234567'],
    ['+4915112345678', '+4915112345678'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(toE164TurkishPhone(input)).toBe(expected);
  });

  it.each([[''], ['123'], [undefined], ['1234567890'], ['+'], ['+ -']])(
    'rejects invalid input %s',
    (input) => {
      expect(toE164TurkishPhone(input as string | undefined)).toBeNull();
    },
  );
});
