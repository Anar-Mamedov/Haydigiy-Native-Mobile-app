import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { trackAssistantEvent } from '../services/assistant-events';
import { ensureConversation } from '../services/assistant-session-flow';
import { useAssistantStore } from '../store/use-assistant-store';

/**
 * Sohbet ekranının yaşam döngüsü: ekran odaklanınca `widget_open` + sohbetin hazırlanması (oturum ya
 * da geçmiş); odaktan çıkınca `widget_close`. Site oturumu değişince (giriş/çıkış) açık sohbet yeniden
 * eşitlenir (README §3 madde 3).
 */
export function useAssistantConversation(available: boolean): void {
  const hasConfig = useAssistantStore((state) => state.config !== null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const focused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!available || !hasConfig) return undefined;
      focused.current = true;
      trackAssistantEvent('widget_open');
      void ensureConversation();
      return () => {
        focused.current = false;
        trackAssistantEvent('widget_close');
      };
    }, [available, hasConfig]),
  );

  useEffect(() => {
    if (focused.current) void ensureConversation();
  }, [userId]);
}
