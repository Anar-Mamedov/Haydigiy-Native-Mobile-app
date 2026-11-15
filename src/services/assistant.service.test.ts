import { assistantHttpClient } from '@/lib/assistant-http';
import { postAssistantEvents } from './assistant.service';

jest.mock('@/lib/assistant-http', () => ({
  ASSISTANT_TURN_TIMEOUT_MS: 15_000,
  assistantHttpClient: { request: jest.fn() },
}));

const mockedRequest = assistantHttpClient.request as jest.Mock;
const events = [{ type: 'widget_close' as const, at: '2026-11-16T10:00:00.000Z' }];

describe('postAssistantEvents', () => {
  it('istek bitince çözülür, olayları oturum başlığıyla gönderir', async () => {
    mockedRequest.mockResolvedValueOnce({ status: 204, data: null });

    await expect(postAssistantEvents('ast_test', events)).resolves.toBeUndefined();

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/assistant/event',
        data: { events },
        headers: expect.objectContaining({ 'X-Assistant-Token': 'ast_test' }),
      }),
    );
  });

  it('401 dahil hiçbir hatada reddetmez (kapanıştaki logout sırası takılmaz)', async () => {
    mockedRequest.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { response: { status: 401 } }));

    await expect(postAssistantEvents('ast_test', events)).resolves.toBeUndefined();
  });
});
