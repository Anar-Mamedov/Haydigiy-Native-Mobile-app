import { resolveConsentStatus } from './use-cookie-consent';

describe('resolveConsentStatus', () => {
  it('reports full consent as accepted', () => {
    expect(resolveConsentStatus({ analytics: true, functional: true, marketing: true })).toBe(
      'accepted',
    );
  });

  it('reports no consent as rejected', () => {
    expect(resolveConsentStatus({ analytics: false, functional: false, marketing: false })).toBe(
      'rejected',
    );
  });

  it('reports a mixed selection as partial, never the invalid "custom"', () => {
    expect(resolveConsentStatus({ analytics: true, functional: false, marketing: false })).toBe(
      'partial',
    );
    expect(resolveConsentStatus({ analytics: false, functional: true, marketing: true })).toBe(
      'partial',
    );
  });
});
