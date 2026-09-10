import { SESSION_TTL_MS, createAnalyticsSession } from './analytics-session';
import { appStorage } from '@/lib/storage/mmkv';

const ANONYMOUS_ID_KEY = 'analytics.anonymous-id';
const SESSION_ID_KEY = 'analytics.session-id';
const SESSION_TOUCHED_AT_KEY = 'analytics.session-touched-at';

function createSession(startAt = 1_700_000_000_000) {
  let now = startAt;
  let counter = 0;

  const session = createAnalyticsSession({
    generateId: () => `generated-${++counter}`,
    now: () => now,
  });

  return {
    session,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

beforeEach(async () => {
  await appStorage.removeItem(ANONYMOUS_ID_KEY);
  await appStorage.removeItem(SESSION_ID_KEY);
  await appStorage.removeItem(SESSION_TOUCHED_AT_KEY);
});

describe('anonymous id', () => {
  it('creates and persists one id on first use', async () => {
    const { session } = createSession();

    await expect(session.getAnonymousId()).resolves.toBe('generated-1');
    // MMKV adaptörü senkron değer döndürebiliyor; `await` her iki durumu da karşılar.
    expect(await appStorage.getItem(ANONYMOUS_ID_KEY)).toBe('generated-1');
  });

  it('reuses the stored id so a returning visitor is the same person', async () => {
    await appStorage.setItem(ANONYMOUS_ID_KEY, 'existing-anon');
    const { session } = createSession();

    await expect(session.getAnonymousId()).resolves.toBe('existing-anon');
  });

  it('replaces a stored value that exceeds the 64-char backend limit', async () => {
    await appStorage.setItem(ANONYMOUS_ID_KEY, 'x'.repeat(65));
    const { session } = createSession();

    await expect(session.getAnonymousId()).resolves.toBe('generated-1');
  });
});

describe('session id', () => {
  it('starts a session and records the touch time', async () => {
    const { session } = createSession(1_000);

    await expect(session.getSessionId()).resolves.toBe('generated-1');
    expect(await appStorage.getItem(SESSION_TOUCHED_AT_KEY)).toBe('1000');
  });

  it('keeps the same session while the user stays active', async () => {
    const { session, advance } = createSession();

    const first = await session.getSessionId();
    advance(SESSION_TTL_MS - 1);

    await expect(session.getSessionId()).resolves.toBe(first);
  });

  it('slides the window on every touch, so a long active visit stays one session', async () => {
    const { session, advance } = createSession();

    const first = await session.getSessionId();
    advance(SESSION_TTL_MS - 1);
    await session.getSessionId();
    advance(SESSION_TTL_MS - 1);

    await expect(session.getSessionId()).resolves.toBe(first);
  });

  it('starts a new session once the inactivity window elapses', async () => {
    const { session, advance } = createSession();

    const first = await session.getSessionId();
    advance(SESSION_TTL_MS);

    const second = await session.getSessionId();
    expect(second).not.toBe(first);
  });

  it('starts a new session when the touch time is missing', async () => {
    await appStorage.setItem(SESSION_ID_KEY, 'orphan-session');
    const { session } = createSession();

    await expect(session.getSessionId()).resolves.toBe('generated-1');
  });

  it('starts a new session when the touch time is corrupt', async () => {
    await appStorage.setItem(SESSION_ID_KEY, 'orphan-session');
    await appStorage.setItem(SESSION_TOUCHED_AT_KEY, 'not-a-number');
    const { session } = createSession();

    await expect(session.getSessionId()).resolves.toBe('generated-1');
  });
});
