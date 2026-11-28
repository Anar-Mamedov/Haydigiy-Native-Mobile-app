import { resolveAssistantButtonState } from './assistant-button-state';

const href = 'https://wa.me/905327805100?text=Merhaba';

describe('resolveAssistantButtonState', () => {
  it('seçim düğmesi geçmişte, meşgulken ve disabled iken etkisizdir', () => {
    const idle = { busy: false, restored: false };
    expect(resolveAssistantButtonState({ disabled: false }, idle)).toEqual({
      action: 'select',
      dimmed: false,
      inactive: false,
    });
    expect(resolveAssistantButtonState({ disabled: false }, { busy: false, restored: true })).toEqual({
      action: 'select',
      dimmed: true,
      inactive: true,
    });
    expect(resolveAssistantButtonState({ disabled: false }, { busy: true, restored: false })).toEqual({
      action: 'select',
      dimmed: false,
      inactive: true,
    });
    expect(resolveAssistantButtonState({ disabled: true }, idle)).toEqual({
      action: 'select',
      dimmed: true,
      inactive: true,
    });
  });

  // Web `c25e8d8e0`: bağlantı eski payload taşımaz; yalnız disabled engeller.
  it('bağlantı düğmesi geçmişte ve meşgulken de çalışır, yalnız disabled engeller', () => {
    expect(resolveAssistantButtonState({ disabled: false, href }, { busy: true, restored: true })).toEqual({
      action: 'link',
      dimmed: false,
      inactive: false,
    });
    expect(resolveAssistantButtonState({ disabled: true, href }, { busy: false, restored: false })).toEqual({
      action: 'link',
      dimmed: true,
      inactive: true,
    });
  });
});
