import { appStorage } from '@/lib/storage/mmkv';
import { readStoredConsent, writeStoredConsent } from './consent-storage';

describe('consent storage', () => {
  beforeEach(async () => {
    await appStorage.removeItem('consent.status');
    await appStorage.removeItem('consent.preferences');
  });

  it('returns null before the user has answered, so the sheet still shows', async () => {
    await expect(readStoredConsent()).resolves.toBeNull();
  });

  it('round-trips a saved selection', async () => {
    await writeStoredConsent({
      preferences: { analytics: true, functional: false, marketing: true },
      status: 'partial',
    });

    await expect(readStoredConsent()).resolves.toEqual({
      preferences: { analytics: true, functional: false, marketing: true },
      status: 'partial',
    });
  });

  it('ignores a status value it does not recognise', async () => {
    await appStorage.setItem('consent.status', 'custom');

    await expect(readStoredConsent()).resolves.toBeNull();
  });

  it('falls back to no consent when the stored preferences are corrupt', async () => {
    await appStorage.setItem('consent.status', 'accepted');
    await appStorage.setItem('consent.preferences', '{bozuk json');

    await expect(readStoredConsent()).resolves.toEqual({
      preferences: { analytics: false, functional: false, marketing: false },
      status: 'accepted',
    });
  });
});
