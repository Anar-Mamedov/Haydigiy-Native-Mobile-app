import { logInsiderCallback } from './insider-diagnostics';
import { InsiderCallbackType } from '../types/insider.types';

function createSink() {
  const messages: string[] = [];
  return { sink: { log: (message: string) => messages.push(message) }, messages };
}

describe('logInsiderCallback', () => {
  it('logs when the SDK reports an InApp was displayed', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(InsiderCallbackType.INAPP_SEEN, { ins_camp_id: '42' }, sink);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('INAPP_SEEN');
    expect(messages[0]).toContain('ins_camp_id');
  });

  it('logs session start and InApp button clicks', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(InsiderCallbackType.SESSION_STARTED, {}, sink);
    logInsiderCallback(InsiderCallbackType.INAPP_BUTTON_CLICK, {}, sink);

    expect(messages).toHaveLength(2);
  });

  // Payload kişisel veri taşıyabilir; teşhis alanları dışında değer loglanmamalı.
  it('never writes non-diagnostic payload values into the log', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(
      InsiderCallbackType.INAPP_SEEN,
      { ins_dl_internal: '/product/gizli-urun', email: 'user@example.com' },
      sink,
    );

    expect(messages[0]).not.toContain('user@example.com');
    expect(messages[0]).not.toContain('/product/gizli-urun');
    expect(messages[0]).toContain('email');
  });

  // Insider Block InApps dokümanı: gösterim anında engellenen InApp de
  // `inapp_seen` gönderir, ayırt edici işaret `dismiss_type: 9`.
  // Bu ayrım olmadan "engellendi" ile "gösterildi" karıştırılır.
  it('flags an InApp that was blocked while being shown', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(
      InsiderCallbackType.INAPP_SEEN,
      { ins_camp_id: '42', dismiss_type: 9 },
      sink,
    );

    expect(messages[0]).toContain('ENGELLENDİ');
    expect(messages[0]).toContain('dismiss_type=9');
    expect(messages[0]).toContain('ins_camp_id=42');
  });

  it('does not flag a normally dismissed InApp as blocked', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(InsiderCallbackType.INAPP_SEEN, { dismiss_type: 1 }, sink);

    expect(messages[0]).not.toContain('ENGELLENDİ');
    expect(messages[0]).toContain('dismiss_type=1');
  });

  it('stays quiet for callback types unrelated to the InApp lifecycle', () => {
    const { sink, messages } = createSink();

    logInsiderCallback(InsiderCallbackType.NOTIFICATION_OPEN, {}, sink);
    logInsiderCallback(InsiderCallbackType.TEMP_STORE_PURCHASE, {}, sink);

    expect(messages).toHaveLength(0);
  });
});
