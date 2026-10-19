import { getAccessToken } from '@/lib/storage/secure-storage';
import {
  AssistantApiError,
  createAssistantSessionDto,
  logoutAssistantSession,
  sendAssistantTurnDto,
} from '@/services/assistant.service';
import { ASSISTANT_FIXTURE_FLOWS } from '../__fixtures__';
import { parseAssistantConfig } from '../api/assistant-config.mapper';
import { useAssistantStore } from '../store/use-assistant-store';
import { ensureConversation, syncAuthState } from './assistant-session-flow';
import { retryAssistantMessage, selectAssistantOption } from './assistant-turn-flow';

jest.mock('@/lib/storage/secure-storage', () => ({ getAccessToken: jest.fn() }));
jest.mock('./assistant-events', () => ({
  flushAssistantEvents: jest.fn(),
  trackAssistantClientError: jest.fn(),
  trackAssistantEvent: jest.fn(),
}));
jest.mock('@/services/assistant.service', () => {
  const actual = jest.requireActual('@/services/assistant.service');
  return {
    ...actual,
    createAssistantSessionDto: jest.fn(),
    getAssistantHistoryDto: jest.fn(),
    logoutAssistantSession: jest.fn(),
    postAssistantEvents: jest.fn(),
    sendAssistantTurnDto: jest.fn(),
  };
});

const fixture = (name: string) =>
  ASSISTANT_FIXTURE_FLOWS[name].steps as {
    response: { status: number; body: Record<string, unknown> };
  }[];

const guestFlow = fixture('guest-menu-navigation');
const memberFlow = fixture('member-orders');
const errors = fixture('errors');
const config = parseAssistantConfig(fixture('config')[0].response.body);
const errorBody = (code: string) => errors.find((step) => step.response.body.code === code)!.response;
const httpError = (code: string) => {
  const { status, body } = errorBody(code);
  return new AssistantApiError('http', status, body);
};
const future = () => new Date(Date.now() + 3_600_000).toISOString();
const withFreshExpiry = (body: Record<string, unknown>) => ({ ...body, expires_at: future() });

const mockedSession = createAssistantSessionDto as jest.Mock;
const mockedTurn = sendAssistantTurnDto as jest.Mock;
const mockedToken = getAccessToken as jest.Mock;

const store = () => useAssistantStore.getState();
const userMessages = () => store().messages.filter((message) => message.role === 'user');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  store().resetConversation();
  useAssistantStore.setState({ disabled: false });
  store().setConfig(config);
  mockedToken.mockResolvedValue(null);
  mockedSession.mockResolvedValue(withFreshExpiry(guestFlow[0].response.body));
});

describe('Haydi Asistan akışları', () => {
  it('oturum açar, karşılama bloklarını ve giriş modunu yazar; site token yoksa Authorization gönderilmez', async () => {
    await ensureConversation();
    expect(mockedSession).toHaveBeenCalledWith(null);
    expect(store().session?.authLevel).toBe('guest');
    expect(store().messages).toHaveLength(1);
    expect(store().input.mode).toBe('none');
  });

  it('seçim iyimser balon çizer, cevabı ekler, konum yolunu günceller', async () => {
    await ensureConversation();
    mockedTurn.mockResolvedValueOnce(guestFlow[1].response.body);
    await selectAssistantOption('menu.help', 'p4', '👤 Hesabım ve Yardım');
    expect(mockedTurn).toHaveBeenCalledWith(expect.stringMatching(/^ast_/), expect.any(String), {
      type: 'select',
      id: 'menu.help',
      payload: 'p4',
    });
    expect(userMessages()[0]).toMatchObject({ text: '👤 Hesabım ve Yardım', status: 'sent' });
    expect(store().breadcrumb.length).toBeGreaterThan(0);
  });

  it('ağ hatasında sessizce bir kez dener; olmazsa "Tekrar dene" AYNI client_msg_id ile gider', async () => {
    jest.useFakeTimers();
    await ensureConversation();
    mockedTurn.mockRejectedValue(new AssistantApiError('network', 0, null));
    const pending = selectAssistantOption('menu.help', 'p4', 'Yardım');
    await jest.advanceTimersByTimeAsync(2100);
    await pending;
    expect(mockedTurn).toHaveBeenCalledTimes(2);
    const failed = userMessages()[0];
    expect(failed).toMatchObject({ status: 'failed' });
    mockedTurn.mockReset();
    mockedTurn.mockResolvedValueOnce(guestFlow[1].response.body);
    await retryAssistantMessage(failed.key);
    const firstId = (mockedTurn.mock.calls[0] as unknown[])[1];
    expect(firstId).toBe(failed.role === 'user' ? failed.retry?.clientMsgId : undefined);
    expect(userMessages()[0]).toMatchObject({ status: 'sent' });
  });

  it('429: mesaj gösterilir, giriş retry_after kadar kilitlenir ve yeni istek atılmaz', async () => {
    await ensureConversation();
    mockedTurn.mockRejectedValueOnce(httpError('rate_limited'));
    await selectAssistantOption('menu.help', 'p4', 'Yardım');
    expect(store().lockedUntil).toBeGreaterThan(Date.now() + 25_000);
    await selectAssistantOption('menu.orders', 'p1', 'Siparişlerim');
    expect(mockedTurn).toHaveBeenCalledTimes(1);
  });

  it('409 stale_choice: mesaj + güncel menü normal balon olarak çizilir, konum yolu boşalır', async () => {
    await ensureConversation();
    mockedTurn.mockRejectedValueOnce(httpError('stale_choice'));
    await selectAssistantOption('menu.orders', 'eski', 'Siparişlerim');
    const last = store().messages[store().messages.length - 1];
    expect(last.role === 'assistant' && last.blocks[0]).toMatchObject({ type: 'text' });
    expect(store().breadcrumb).toEqual([]);
  });

  it('401 session_expired: mesaj gösterilir, yeni oturum açılır, eylem tekrar gönderilmez', async () => {
    await ensureConversation();
    mockedTurn.mockRejectedValueOnce(httpError('session_expired'));
    await selectAssistantOption('menu.help', 'p4', 'Yardım');
    expect(mockedSession).toHaveBeenCalledTimes(2);
    expect(mockedTurn).toHaveBeenCalledTimes(1);
  });

  it('403 assistant_disabled: asistan kapanır', async () => {
    await ensureConversation();
    mockedTurn.mockRejectedValueOnce(httpError('assistant_disabled'));
    await selectAssistantOption('menu.help', 'p4', 'Yardım');
    expect(store().disabled).toBe(true);
    expect(store().messages).toEqual([]);
  });

  it('siteden çıkış yapılınca üye oturumu atılır, balonlar silinir, misafir oturumu açılır', async () => {
    mockedToken.mockResolvedValue('SITE');
    mockedSession.mockResolvedValueOnce(withFreshExpiry(memberFlow[0].response.body));
    await ensureConversation();
    expect(store().session?.authLevel).toBe('site_login');
    mockedToken.mockResolvedValue(null);
    expect(await syncAuthState()).toBe(true);
    expect(logoutAssistantSession).toHaveBeenCalled();
    expect(store().session?.authLevel).toBe('guest');
    expect(store().messages).toHaveLength(1);
  });
});
