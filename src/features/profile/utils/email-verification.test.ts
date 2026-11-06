import { getUnverifiedEmail } from './email-verification';

describe('getUnverifiedEmail', () => {
  it('returns the saved address while it is not verified', () => {
    expect(getUnverifiedEmail({ email: ' anar@example.com ', emailVerified: false })).toBe(
      'anar@example.com',
    );
  });

  it('returns null for a verified address', () => {
    expect(getUnverifiedEmail({ email: 'anar@example.com', emailVerified: true })).toBeNull();
  });

  it('returns null when there is no address or no profile yet', () => {
    expect(getUnverifiedEmail({ email: null, emailVerified: false })).toBeNull();
    expect(getUnverifiedEmail({ email: '   ', emailVerified: false })).toBeNull();
    expect(getUnverifiedEmail(null)).toBeNull();
  });
});
