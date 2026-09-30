import { hasInsiderIdentifierChanged, toE164TurkishPhone } from './insider-identity';
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
});

describe('toE164TurkishPhone', () => {
  it.each([
    ['5321234567', '+905321234567'],
    ['05321234567', '+905321234567'],
    ['+905321234567', '+905321234567'],
    ['0532 123 45 67', '+905321234567'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(toE164TurkishPhone(input)).toBe(expected);
  });

  it.each([[''], ['123'], [undefined], ['1234567890']])('rejects invalid input %s', (input) => {
    expect(toE164TurkishPhone(input as string | undefined)).toBeNull();
  });
});
