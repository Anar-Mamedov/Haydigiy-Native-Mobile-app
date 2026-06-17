import { appStorage } from '@/lib/storage/mmkv';

const DEVICE_ID_KEY = 'cart.device-id';

let cachedDeviceId: string | null = null;

function generateDeviceId(): string {
  const random = Math.random().toString(36).slice(2, 11);
  const time = Date.now().toString(36);
  return `device-${time}-${random}`;
}

/**
 * Stable per-install identifier used to attribute a guest (unauthenticated) cart
 * on the backend. Persisted in MMKV so the guest cart survives app restarts and
 * can later be merged into the account cart after login.
 *
 * Note: this is a non-sensitive correlation id, not a credential, so MMKV (not
 * SecureStore) is the right place for it.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  const existing = await appStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    cachedDeviceId = existing;
    return existing;
  }

  const created = generateDeviceId();
  await appStorage.setItem(DEVICE_ID_KEY, created);
  cachedDeviceId = created;
  return created;
}
