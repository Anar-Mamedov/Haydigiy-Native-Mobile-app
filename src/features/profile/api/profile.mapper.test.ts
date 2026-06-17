import { mapUserProfile } from './profile.mapper';

describe('mapUserProfile', () => {
  it('reads email_verified from the response root', () => {
    const result = mapUserProfile({ email_verified: false, user: { name: 'Anar' } });
    expect(result.emailVerified).toBe(false);
    expect(result.name).toBe('Anar');
  });

  it('falls back to the nested user email_verified when no root flag', () => {
    const result = mapUserProfile({ user: { name: 'Anar', email_verified: true } });
    expect(result.emailVerified).toBe(true);
  });

  it('supports a flat profile shape without a nested user', () => {
    const result = mapUserProfile({ name: 'Anar', surname: 'M', email_verified: true });
    expect(result).toMatchObject({ name: 'Anar', surname: 'M', emailVerified: true });
  });

  it('defaults to not-verified (shows DOĞRULA) when the flag is absent', () => {
    const result = mapUserProfile({ user: { name: 'Anar' } });
    expect(result.emailVerified).toBe(false);
  });

  it('prefers the root flag over the nested one', () => {
    const result = mapUserProfile({ email_verified: true, user: { email_verified: false } });
    expect(result.emailVerified).toBe(true);
  });
});
