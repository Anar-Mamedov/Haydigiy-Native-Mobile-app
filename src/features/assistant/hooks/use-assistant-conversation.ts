import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { trackAssistantEvent } from '../services/assistant-events';
import { closeAssistant, ensureConversation } from '../services/assistant-session-flow';
import { useAssistantStore } from '../store/use-assistant-store';

type AssistantConversation = {
  /** Tamamen kapatma (X): sohbet ve oturum kapanır; ekrandan çıkmak çağırana kalır. */
  close: () => void;
};

/**
 * Sohbet ekranının yaşam döngüsü: ekran odaklanınca `widget_open` + sohbetin hazırlanması (oturum ya
 * da geçmiş); odaktan çıkınca (geri) `widget_close`. X ile kapatmada `widget_close`'u `closeAssistant`
 * logout'tan önce kendisi gönderir; ardından gelen odak kaybı ikinci bir olay atmaz (webde de kapatma tek
 * olaydır). Site oturumu değişince (giriş/çıkış) açık sohbet yeniden eşitlenir (README §3 madde 3).
 */
export function useAssistantConversation(available: boolean): AssistantConversation {
  const hasConfig = useAssistantStore((state) => state.config !== null);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const focused = useRef(false);
  const closed = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!available || !hasConfig) return undefined;
      focused.current = true;
      closed.current = false;
      trackAssistantEvent('widget_open');
      void ensureConversation();
      return () => {
        focused.current = false;
        if (!closed.current) trackAssistantEvent('widget_close');
      };
    }, [available, hasConfig]),
  );

  useEffect(() => {
    if (focused.current) void ensureConversation();
  }, [userId]);

  const close = useCallback(() => {
    closed.current = true;
    closeAssistant();
  }, []);

  return { close };
}
