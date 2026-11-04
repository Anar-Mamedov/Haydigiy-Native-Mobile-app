import { splitLeadingEmoji } from './assistant-label-emoji';

describe('splitLeadingEmoji', () => {
  it.each([
    ['📦 Siparişlerim', '📦', 'Siparişlerim'],
    ['  🚚 Kargom nerede?', '🚚', 'Kargom nerede?'],
    ['↩️ İade ve değişim', '↩️', 'İade ve değişim'],
    ['❤️ Favorilerim', '❤️', 'Favorilerim'],
    ['👩‍💻 Canlı destek', '👩‍💻', 'Canlı destek'],
    ['👍🏽 Evet', '👍🏽', 'Evet'],
    ['🇹🇷 Türkiye', '🇹🇷', 'Türkiye'],
    ['💬Canlı Destek', '💬', 'Canlı Destek'],
  ])('splits %p into the icon and the text', (label, icon, text) => {
    expect(splitLeadingEmoji(label)).toEqual({ icon, text });
  });

  it.each(['Siparişlerim', '↩ İade', '2 taksit', '#1234 numaralı sipariş', ''])(
    'leaves %p untouched when it does not start with an emoji',
    (label) => {
      expect(splitLeadingEmoji(label)).toEqual({ icon: null, text: label });
    },
  );

  it('keeps an emoji-only label as plain text so it is not drawn twice', () => {
    expect(splitLeadingEmoji('👍')).toEqual({ icon: null, text: '👍' });
  });

  it('only splits the leading emoji, never one later in the label', () => {
    expect(splitLeadingEmoji('Kargo 🚚 takibi')).toEqual({ icon: null, text: 'Kargo 🚚 takibi' });
  });
});
