import { getAccessToken } from '@/lib/storage/secure-storage';
import { createAssistantSessionDto, logoutAssistantSession } from '@/services/assistant.service';
import { ASSISTANT_FIXTURE_FLOWS } from '../__fixtures__';
import { parseAssistantConfig } from '../api/assistant-config.mapper';
import { useAssistantStore, type AssistantSession } from '../store/use-assistant-store';
import { flushAssistantEventNow } from './assistant-events';
import { closeAssistant, syncAuthState } from './assistant-session-flow';

jest.mock('@/lib/storage/secure-storage', () => ({ getAccessToken: jest.fn() }));
jest.mock('./assistant-events', () => ({
  flushAssistantEventNow: jest.fn(),
  trackAssistantClientError: jest.fn(),
  trackAssistantEvent: jest.fn(),
}));
jest.mock('@/services/assistant.service', () => ({
  ...jest.requireActual('@/services/assistant.service'),
  createAssistantSessionDto: jest.fn(),
  logoutAssistantSession: jest.fn(),
}));

const config = parseAssistantConfig(ASSISTANT_FIXTURE_FLOWS.config.steps[0].response.body);
const guestBody = ASSISTANT_FIXTURE_FLOWS['guest-menu-navigation'].steps[0].response.body;
const future = () => new Date(Date.now() + 3_600_000).toISOString();

const session = (authLevel: AssistantSession['authLevel']): AssistantSession => ({
  token: `ast_${authLevel}`,
  sessionId: 's1',
  expiresAt: future(),
  authLevel,
  siteTokenSent: authLevel === 'site_login',
});

/** `widget_close` isteğini test bitirene kadar açık tutar. */
function deferredEvent() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  (flushAssistantEventNow as jest.Mock).mockReturnValueOnce(promise);
  return resolve;
}

const store = () => useAssistantStore.getState();
const flushPromises = () => new Promise<void>((done) => setImmediate(() => done()));

beforeEach(() => {
  jest.clearAllMocks();
  (flushAssistantEventNow as jest.Mock).mockResolvedValue(undefined);
  store().resetConversation();
  useAssistantStore.setState({ disabled: false });
  store().setConfig(config);
});

describe('closeAssistant (X)', () => {
  it('misafir oturumunda widget_close gider, logout atılmaz, sohbet hemen silinir', async () => {
    store().setSession(session('guest'));

    closeAssistant();
    await flushPromises();

    expect(flushAssistantEventNow).toHaveBeenCalledWith('widget_close');
    expect(logoutAssistantSession).not.toHaveBeenCalled();
    expect(store().session).toBeNull();
  });

  it('girişli oturumda logout, widget_close isteği bittikten SONRA atılır', async () => {
    const finishEvent = deferredEvent();
    store().setSession(session('site_login'));

    closeAssistant();
    expect(store().session).toBeNull();
    await flushPromises();
    expect(logoutAssistantSession).not.toHaveBeenCalled();

    finishEvent();
    await flushPromises();
    expect(logoutAssistantSession).toHaveBeenCalledWith('ast_site_login');
  });

  it('oturum yokken hiçbir istek atılmaz', async () => {
    closeAssistant();
    await flushPromises();

    expect(flushAssistantEventNow).not.toHaveBeenCalled();
    expect(logoutAssistantSession).not.toHaveBeenCalled();
  });
});

describe('syncAuthState', () => {
  it('misafir oturumdayken siteye giriş yapılınca eski misafir oturumuna logout atılmaz, yeni oturum açılır', async () => {
    store().setSession(session('guest'));
    (getAccessToken as jest.Mock).mockResolvedValue('SITE');
    (createAssistantSessionDto as jest.Mock).mockResolvedValue({ ...guestBody, auth_level: 'site_login', expires_at: future() });

    expect(await syncAuthState()).toBe(true);

    expect(logoutAssistantSession).not.toHaveBeenCalled();
    expect(createAssistantSessionDto).toHaveBeenCalledWith('SITE');
    expect(store().session?.authLevel).toBe('site_login');
  });
});
