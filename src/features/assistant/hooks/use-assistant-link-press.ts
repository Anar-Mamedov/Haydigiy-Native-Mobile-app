import { useRouter, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Linking } from 'react-native';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import type { AssistantLinkButtonBlock } from '@/types/assistant.types';
import { trackAssistantEvent } from '../services/assistant-events';
import { resolveAssistantLinkTarget } from '../utils/assistant-link-target';

/**
 * link_button dokunuşu (README §7.1): (1) `link_click` beklemeden atılır → (2) hedef açılır.
 * Uygulama telefon arayüzü olduğu için `href.mobile` kullanılır. Hedef ekran sohbetin ÜSTÜNE açılır;
 * geri tuşu sohbete döner ve sohbet bellekte kalır.
 */
export function useAssistantLinkPress() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.user !== null);

  return useCallback(
    (block: AssistantLinkButtonBlock) => {
      trackAssistantEvent('link_click', { blockId: block.id, kind: block.kind }, { flushNow: true });
      const target = resolveAssistantLinkTarget(block.href.mobile, isAuthenticated);
      if (target.type === 'route') {
        router.push(target.path as Href);
        return;
      }
      WebBrowser.openBrowserAsync(target.url).catch(() => Linking.openURL(target.url).catch(() => undefined));
    },
    [isAuthenticated, router],
  );
}
