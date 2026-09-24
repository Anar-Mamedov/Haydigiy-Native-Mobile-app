import { useCallback, useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { Href, useRootNavigationState, useRouter } from 'expo-router';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';
import { insiderClient } from '../services/insider-client';
import { insiderTracker } from '../services/insider-tracker';
import { InsiderCallback, InsiderPushAction } from '../types/insider.types';
import { logInsiderCallback } from '../utils/insider-diagnostics';
import { resolveInsiderCallbackAction } from '../utils/insider-url';

export function InsiderIntegration() {
  const router = useRouter();
  const navigationKey = useRootNavigationState()?.key;
  const [latestAction, setLatestAction] = useState<InsiderPushAction>(null);
  const consumedAction = useRef<InsiderPushAction>(null);

  /**
   * SDK yedi ayrı callback tipi yayınlar. Burada yalnızca yönlendirme taşıyanlar
   * (push açılışı ve InApp buton tıklaması) işlenir; hangi tiplerin bu kapsama
   * girdiği `resolveInsiderCallbackAction` içinde tanımlıdır.
   */
  const handleInsiderCallback = useCallback<InsiderCallback>(
    (type, payload) => {
      // InApp'in cihaza ulaşıp ulaşmadığı yalnızca buradan görülebilir.
      logInsiderCallback(type, payload);

      const action = resolveInsiderCallbackAction(type, payload);
      if (action) setLatestAction(action);
    },
    [],
  );

  useEffect(() => {
    // A notification can open the app before the root navigator mounts.
    // Keep the latest tapped target until navigation is ready.
    if (!navigationKey || !latestAction || consumedAction.current === latestAction) return;
    consumedAction.current = latestAction;

    if (latestAction.type === 'internal') {
      router.dismissTo(resolveDeepLinkPath(latestAction.url) as Href);
      return;
    }

    Linking.openURL(latestAction.url).catch((error) => {
      console.warn('[Insider] Harici bağlantı açılamadı.', error);
    });
  }, [navigationKey, latestAction, router]);

  useEffect(() => {
    // Öneri tıklama hafızası kalıcı; 3D Secure sırasında süreç öldürülürse satın alma
    // eventi ancak geri yüklenen kayıtla öneri kampanyasına bağlanabilir.
    void insiderTracker.restoreRecommendationAttribution();
  }, []);

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
