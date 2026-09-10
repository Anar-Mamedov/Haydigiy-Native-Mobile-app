import { createAnalyticsConsentGate } from './analytics-consent';
import { StoredConsent } from '@/features/consent/types/consent.types';

describe('analytics consent gate', () => {
  it('denies everything before the user has answered', () => {
    const gate = createAnalyticsConsentGate(async () => null);

    expect(gate.isAllowed('analytics')).toBe(false);
    expect(gate.isAllowed('marketing')).toBe(false);
  });

  it('still denies everything after restoring an unanswered choice', async () => {
    const gate = createAnalyticsConsentGate(async () => null);

    await gate.restore();

    expect(gate.isAllowed('analytics')).toBe(false);
  });

  it('honours a partial choice per category', async () => {
    const stored: StoredConsent = {
      preferences: { analytics: true, functional: true, marketing: false },
      status: 'partial',
    };
    const gate = createAnalyticsConsentGate(async () => stored);

    await gate.restore();

    expect(gate.isAllowed('analytics')).toBe(true);
    expect(gate.isAllowed('marketing')).toBe(false);
  });

  it('denies everything when the store throws, rather than assuming consent', async () => {
    const gate = createAnalyticsConsentGate(async () => {
      throw new Error('mmkv unavailable');
    });

    await expect(gate.restore()).resolves.toBeUndefined();
    expect(gate.isAllowed('analytics')).toBe(false);
  });

  it('applies a fresh choice without waiting for the store', () => {
    const gate = createAnalyticsConsentGate(async () => null);

    gate.apply({ analytics: true, functional: true, marketing: true });

    expect(gate.isAllowed('marketing')).toBe(true);
  });

  it('revokes access when the user withdraws consent', () => {
    const gate = createAnalyticsConsentGate(async () => null);

    gate.apply({ analytics: true, functional: true, marketing: true });
    gate.apply({ analytics: false, functional: false, marketing: false });

    expect(gate.isAllowed('analytics')).toBe(false);
  });
});
