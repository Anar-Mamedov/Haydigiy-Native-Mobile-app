import { postAssistantEvents } from '@/services/assistant.service';
import { useAssistantStore } from '../store/use-assistant-store';
import { flushAssistantEventNow, trackAssistantEvent } from './assistant-events';

jest.mock('@/services/assistant.service', () => ({
  ...jest.requireActual('@/services/assistant.service'),
  postAssistantEvents: jest.fn(),
}));

const mockedPost = postAssistantEvents as jest.Mock;
const flushPromises = () => new Promise<void>((done) => setImmediate(() => done()));

beforeEach(() => {
  jest.clearAllMocks();
  mockedPost.mockResolvedValue(undefined);
  useAssistantStore.getState().resetConversation();
  useAssistantStore.getState().setSession({
    token: 'ast_test',
    sessionId: 's1',
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    authLevel: 'guest',
    siteTokenSent: false,
  });
});

describe('flushAssistantEventNow', () => {
  it('olayı bekleyenlerle birlikte hemen gönderir ve istek bitince çözülür', async () => {
    let finishRequest!: () => void;
    mockedPost.mockReturnValueOnce(
      new Promise<void>((done) => {
        finishRequest = done;
      }),
    );
    trackAssistantEvent('widget_open');

    let settled = false;
    const sent = flushAssistantEventNow('widget_close').then(() => {
      settled = true;
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][0]).toBe('ast_test');
    expect(mockedPost.mock.calls[0][1].map((event: { type: string }) => event.type)).toEqual([
      'widget_open',
      'widget_close',
    ]);
    await flushPromises();
    expect(settled).toBe(false);

    finishRequest();
    await sent;
    expect(settled).toBe(true);
  });

  it('oturum yoksa beklemeden çözülür (kapanış logout için asılı kalmaz)', async () => {
    jest.useFakeTimers();
    try {
      useAssistantStore.getState().setSession(null);

      await expect(flushAssistantEventNow('widget_close')).resolves.toBeUndefined();
      expect(mockedPost).not.toHaveBeenCalled();
    } finally {
      jest.clearAllTimers();
      jest.useRealTimers();
    }
  });
});
