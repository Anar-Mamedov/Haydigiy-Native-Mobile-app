import { toAnalyticsUserId, userToAnalyticsIdentity } from './analytics-identity';
import { User } from '@/types/auth.types';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: '42',
    email: 'ayse@example.com',
    name: 'Ayşe',
    surname: 'Yılmaz',
    ...overrides,
  } as User;
}

describe('toAnalyticsUserId', () => {
  it('accepts the number the backend actually returns', () => {
    expect(toAnalyticsUserId(42)).toBe(42);
  });

  it('parses the string the User contract declares', () => {
    expect(toAnalyticsUserId('42')).toBe(42);
  });

  it('truncates a fractional id instead of sending a float to an integer column', () => {
    expect(toAnalyticsUserId(42.9)).toBe(42);
  });

  it.each([undefined, null, '', '   ', 'abc', {}, NaN, Infinity])(
    'rejects %p rather than reporting a bogus id',
    (value) => {
      expect(toAnalyticsUserId(value)).toBeNull();
    },
  );
});

describe('userToAnalyticsIdentity', () => {
  it('carries the id with the contactable identifiers', () => {
    expect(
      userToAnalyticsIdentity(buildUser({ phoneNumber: '+905321234567' })),
    ).toEqual({
      userId: 42,
      email: 'ayse@example.com',
      phone: '+905321234567',
    });
  });

  it('drops an email without @ so a broken value never reaches a provider', () => {
    expect(userToAnalyticsIdentity(buildUser({ email: 'ayse.example.com' }))?.email).toBeUndefined();
  });

  it('omits an empty phone instead of sending a blank string', () => {
    expect(userToAnalyticsIdentity(buildUser({ phoneNumber: '   ' }))?.phone).toBeUndefined();
  });

  it('returns null when the id cannot be resolved, so the caller skips identify', () => {
    expect(userToAnalyticsIdentity(buildUser({ id: 'not-a-number' }))).toBeNull();
  });
});
