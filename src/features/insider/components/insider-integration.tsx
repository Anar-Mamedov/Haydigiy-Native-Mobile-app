import { useCallback, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Href, useRouter } from 'expo-router';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';
import { insiderClient } from '../services/insider-client';
import { InsiderCallback } from '../types/insider.types';
import { resolveInsiderPushAction } from '../utils/insider-url';

const NOTIFICATION_OPEN = 0;

export function InsiderIntegration() {
  const router = useRouter();

  const handleInsiderCallback = useCallback<InsiderCallback>(
    (type, payload) => {
      if (type !== NOTIFICATION_OPEN) return;

      const action = resolveInsiderPushAction(payload);
      if (!action) return;

      if (action.type === 'internal') {
        router.dismissTo(resolveDeepLinkPath(action.url) as Href);
        return;
      }

      Linking.openURL(action.url).catch((error) => {
        console.warn('[Insider] Harici push bağlantısı açılamadı.', error);
      });
    },
    [router],
  );

  useEffect(() => {
    if (!insiderClient.initialize(handleInsiderCallback)) return;

    const handleUrl = ({ url }: { url: string }) => {
      insiderClient.handleIncomingUrl(url);
    };

    Linking.getInitialURL()
      .then((url) => {
        if (url) insiderClient.handleIncomingUrl(url);
      })
      .catch((error) => {
        console.warn('[Insider] İlk uygulama bağlantısı okunamadı.', error);
      });

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
      insiderClient.clearCallback(handleInsiderCallback);
    };
  }, [handleInsiderCallback]);

  return null;
}
