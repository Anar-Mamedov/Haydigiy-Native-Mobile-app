import { Component, useEffect, type ReactNode } from 'react';
import type { ErrorBoundaryProps } from 'expo-router';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState } from '@/components/ui/empty-state';
import { DEFAULT_ASSISTANT_FALLBACK } from '../api/assistant-config.mapper';
import { trackAssistantClientError } from '../services/assistant-events';
import { useAssistantStore } from '../store/use-assistant-store';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';
import { AssistantLiveSupport } from './blocks/assistant-live-support';

/**
 * Asistan ekranının hata sınırı (README §2 kural 14, kabul 41): ekranda bir istisna olursa uygulamanın
 * geri kalanı etkilenmez; müşteri yedek metni, Canlı Destek'i, "Tekrar dene"yi ve geri dönüşü görür.
 * Expo Router rota dosyasından `ErrorBoundary` olarak dışa verilir.
 */
export function AssistantScreenErrorBoundary({ retry }: ErrorBoundaryProps) {
  const router = useRouter();
  const theme = useTheme();
  const config = useAssistantStore((state) => state.config);
  const texts = config?.texts ?? DEFAULT_ASSISTANT_TEXTS;
  const fallback = config?.fallback ?? DEFAULT_ASSISTANT_FALLBACK;

  useEffect(() => {
    trackAssistantClientError('render_error');
  }, []);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={{ backgroundColor: theme.background.val, flex: 1 }}
    >
      <YStack gap="$4" padding="$4" testID="assistant-error-boundary">
        <EmptyState
          actionLabel={texts.retry}
          description={fallback.error_text}
          onActionPress={() => void retry()}
          title={texts.title}
        />
        <AssistantLiveSupport
          href={fallback.live_support.href}
          label={fallback.live_support.label}
          numberLabel={fallback.live_support.number_label}
          texts={texts}
        />
        <AppButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          {texts.close_label}
        </AppButton>
      </YStack>
    </SafeAreaView>
  );
}

type SilentBoundaryProps = { children: ReactNode };

/**
 * Sekme düzeninde duran giriş düğmesi için sessiz hata sınırı: düğmede bir hata olursa düğme
 * kaybolur, sekmeler ve ekranlar çalışmaya devam eder.
 */
export class AssistantSilentBoundary extends Component<SilentBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    trackAssistantClientError('render_error');
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
