import { appStorage } from '@/lib/storage/mmkv';

/**
 * Analytics kimlikleri. Web'deki `hg_anon_id` (localStorage) + `hg_sess_id`
 * (sessionStorage) çiftinin native karşılığı: RN'de sessionStorage olmadığı
 * için oturum kimliği de MMKV'de tutulur ve son dokunma zamanıyla süresi
 * denetlenir.
 *
 * İkisi de korelasyon kimliğidir, kimlik bilgisi değildir — bu yüzden MMKV
 * (SecureStore değil) doğru yerdir.
 */

const ANONYMOUS_ID_KEY = 'analytics.anonymous-id';
const SESSION_ID_KEY = 'analytics.session-id';
const SESSION_TOUCHED_AT_KEY = 'analytics.session-touched-at';

/** Web ile aynı: 30 dakika hareketsizlik oturumu bitirir. */
export const SESSION_TTL_MS = 30 * 60 * 1000;

/** Backend `anonymous_id`/`session_id` alanlarını 64 karakterle sınırlıyor. */
const MAX_ID_LENGTH = 64;

export type AnalyticsSessionDependencies = {
  now: () => number;
  generateId: () => string;
};

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 11);
  const extra = Math.random().toString(36).slice(2, 11);
  return `${Date.now().toString(36)}-${random}${extra}`;
}

const defaultDependencies: AnalyticsSessionDependencies = {
  now: () => Date.now(),
  generateId,
};

export function createAnalyticsSession(
  dependencies: AnalyticsSessionDependencies = defaultDependencies,
) {
  let cachedAnonymousId: string | null = null;

  const readStoredId = async (key: string): Promise<string | null> => {
    const value = await appStorage.getItem(key);
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= MAX_ID_LENGTH ? trimmed : null;
  };

  return {
    /** Kurulum boyunca değişmeyen ziyaretçi kimliği. */
    async getAnonymousId(): Promise<string> {
      if (cachedAnonymousId) return cachedAnonymousId;

      const existing = await readStoredId(ANONYMOUS_ID_KEY);
      if (existing) {
        cachedAnonymousId = existing;
        return existing;
      }

      const created = dependencies.generateId();
      cachedAnonymousId = created;
      await appStorage.setItem(ANONYMOUS_ID_KEY, created);
      return created;
    },

    /**
     * Aktif oturum kimliği. Her çağrıda son dokunma zamanı tazelenir; TTL
     * aşıldıysa yeni oturum başlar (web `getSessionId` paritesi).
     */
    async getSessionId(): Promise<string> {
      const now = dependencies.now();
      const stored = await readStoredId(SESSION_ID_KEY);
      const touchedAtRaw = await appStorage.getItem(SESSION_TOUCHED_AT_KEY);
      const touchedAt = Number.parseInt(touchedAtRaw ?? '0', 10);
      const isAlive =
        Boolean(stored) && Number.isFinite(touchedAt) && now - touchedAt < SESSION_TTL_MS;

      if (stored && isAlive) {
        await appStorage.setItem(SESSION_TOUCHED_AT_KEY, String(now));
        return stored;
      }

      const created = dependencies.generateId();
      await appStorage.setItem(SESSION_ID_KEY, created);
      await appStorage.setItem(SESSION_TOUCHED_AT_KEY, String(now));
      return created;
    },
  };
}

export type AnalyticsSession = ReturnType<typeof createAnalyticsSession>;

export const analyticsSession = createAnalyticsSession();
