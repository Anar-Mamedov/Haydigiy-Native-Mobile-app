import { useRouter } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner, useTheme, YStack } from 'tamagui';
import { EmptyState } from '@/components/ui/empty-state';
import { DEFAULT_ASSISTANT_FALLBACK } from '../api/assistant-config.mapper';
import { AssistantBreadcrumb } from '../components/assistant-breadcrumb';
import { AssistantComposer } from '../components/assistant-composer';
import { AssistantHeader } from '../components/assistant-header';
import { AssistantMessageList } from '../components/assistant-message-list';
import { AssistantLiveSupport } from '../components/blocks/assistant-live-support';
import { useAssistantAvailability } from '../hooks/use-assistant-availability';
import { useAssistantConversation } from '../hooks/use-assistant-conversation';
import { closeAssistant } from '../services/assistant-session-flow';
import { useAssistantStore } from '../store/use-assistant-store';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';

/**
 * Haydi Asistan sohbet ekranı (webdeki mobil tam ekran panelin karşılığı). Geri: sohbet korunur;
 * X: sohbet ve oturum kapanır. Bağlantılar hedef ekranı sohbetin üstüne açar; geri tuşu buraya döner.
 * Durumlar: yükleniyor · `/config` alınamadı (yeniden dene) · asistan kapalı (Canlı Destek yedeği) · sohbet.
 */
export function AssistantScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { available, config, isLoading, isError, refetch } = useAssistantAvailability();
  useAssistantConversation(available);
  const inputMode = useAssistantStore((state) => state.input.mode);
  const texts = config?.texts ?? DEFAULT_ASSISTANT_TEXTS;
  const fallback = config?.fallback ?? DEFAULT_ASSISTANT_FALLBACK;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const handleClose = () => {
    closeAssistant();
    goBack();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <YStack alignItems="center" flex={1} justifyContent="center" testID="assistant-loading">
          <Spinner color="$brand" size="large" />
        </YStack>
      );
    }
    if (isError || !config) {
      return (
        <EmptyState
          actionLabel={texts.retry}
          description={fallback.error_text}
          onActionPress={refetch}
          title={texts.title}
        />
      );
    }
    if (!available) {
      return (
        <YStack gap="$4" padding="$4" testID="assistant-unavailable">
          <EmptyState description={fallback.error_text} title={texts.title} />
          <AssistantLiveSupport
            href={fallback.live_support.href}
            label={fallback.live_support.label}
            numberLabel={fallback.live_support.number_label}
            texts={texts}
          />
        </YStack>
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <AssistantMessageList texts={texts} />
        <AssistantBreadcrumb texts={texts} />
        {inputMode === 'text' ? <AssistantComposer texts={texts} /> : null}
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={{ backgroundColor: theme.background.val, flex: 1 }}
    >
      <AssistantHeader onBack={goBack} onClose={handleClose} texts={texts} />
      <YStack backgroundColor="$color1" flex={1}>
        {renderBody()}
      </YStack>
    </SafeAreaView>
  );
}
