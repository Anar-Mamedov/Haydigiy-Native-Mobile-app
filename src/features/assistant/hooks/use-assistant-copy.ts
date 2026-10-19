import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';

export type AssistantCopyState = 'idle' | 'copied' | 'manual';

const COPIED_RESET_MS = 2500;

/**
 * Panoya kopyalama (README §7.2). Pano reddederse `manual` döner ve metin seçilebilir alanda
 * gösterilir; böylece müşteri WhatsApp mesajını yine de elle kopyalayabilir.
 */
export function useAssistantCopy() {
  const [state, setState] = useState<AssistantCopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async (text: string): Promise<AssistantCopyState> => {
    let next: AssistantCopyState = 'manual';
    try {
      next = (await Clipboard.setStringAsync(text)) === false ? 'manual' : 'copied';
    } catch {
      next = 'manual';
    }
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    if (next === 'copied') timer.current = setTimeout(() => setState('idle'), COPIED_RESET_MS);
    return next;
  }, []);

  return { state, copy };
}
