import type { AssistantButtonItem } from '@/types/assistant.types';

export type AssistantButtonState = {
  /** `link`: wa.me adresi açılır, sunucuya seçim gitmez; `select`: id/payload ile seçim turu. */
  action: 'link' | 'select';
  /** Dokunuş etkisiz mi. */
  inactive: boolean;
  /** Düğme soluk çizilsin mi. */
  dimmed: boolean;
};

/**
 * Seçenek düğmesinin dokunuşta ne yapacağını ve ne zaman etkisiz olacağını belirler.
 * - Seçim düğmesi geri yüklenen geçmişte (README §4.5), istek uçuştayken ve `disabled` iken etkisizdir.
 * - Bağlantı düğmesi (web `c25e8d8e0`) eski payload taşımadığı için geçmişte ve meşgulken de
 *   çalışır; yalnız `disabled` engeller ve yalnız o zaman soluk çizilir.
 */
export function resolveAssistantButtonState(
  item: Pick<AssistantButtonItem, 'disabled' | 'href'>,
  context: { busy: boolean; restored: boolean },
): AssistantButtonState {
  if (item.href) {
    return { action: 'link', dimmed: item.disabled, inactive: item.disabled };
  }

  return {
    action: 'select',
    dimmed: context.restored || item.disabled,
    inactive: context.restored || context.busy || item.disabled,
  };
}
