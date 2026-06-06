import { appEnv } from '@/lib/env';
import { getAccessToken } from '@/lib/storage/secure-storage';

/**
 * Centralized authentication check. All privileged flows should go through this
 * boundary instead of reading SecureStore or env directly.
 *
 * When the API base URL is not configured (local/Expo Go development) the app
 * behaves as authenticated so flows stay testable without a backend.
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!appEnv.apiBaseUrl) {
    return true;
  }
  const token = await getAccessToken();
  return !!token;
}
