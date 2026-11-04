import { useRouter, type Href } from 'expo-router';
import { YStack } from 'tamagui';
import { MessageCircleMore } from '@/components/ui/icons';
import { useAssistantLauncherVisibility } from '../hooks/use-assistant-launcher-visibility';
import {
  ASSISTANT_LAUNCHER_AVATAR_SIZE as AVATAR_SIZE,
  ASSISTANT_LAUNCHER_INSET_TOKEN,
  ASSISTANT_LAUNCHER_SIZE as BUTTON_SIZE,
} from '../utils/assistant-launcher-layout';

/** Yazılı rota tipleri `expo start`'ta yeniden üretilir; yeni rota o zamana kadar `Href` olarak verilir. */
export const ASSISTANT_ROUTE = '/assistant' as Href;

/**
 * Sağ-alt "Haydi Asistan" düğmesi; hangi ekranlarda çizildiği `assistant-launcher-visibility.ts`'te.
 * Mobil web düğmesiyle aynı görünüm (frontend `AssistantLauncher.tsx`, <768 px): yazısız, 56 px koyu daire
 * içinde 44 px turuncu daire ve 24 px simge. Ekran okuyucu `open_label`'ı okur.
 */
export function AssistantLauncher() {
  const router = useRouter();
  const { config } = useAssistantLauncherVisibility();

  if (!config) return null;

  return (
    <YStack bottom={ASSISTANT_LAUNCHER_INSET_TOKEN} position="absolute" right={ASSISTANT_LAUNCHER_INSET_TOKEN} zIndex={30}>
      <YStack
        accessibilityLabel={config.texts.open_label}
        accessibilityRole="button"
        alignItems="center"
        backgroundColor="$color12"
        borderRadius={BUTTON_SIZE / 2}
        elevation={6}
        height={BUTTON_SIZE}
        justifyContent="center"
        onPress={() => router.push(ASSISTANT_ROUTE)}
        pressStyle={{ opacity: 0.9, scale: 0.97 }}
        shadowColor="$shadowColor"
        shadowOffset={{ height: 4, width: 0 }}
        shadowOpacity={0.25}
        shadowRadius={10}
        testID="assistant-launcher"
        width={BUTTON_SIZE}
      >
        <YStack
          alignItems="center"
          backgroundColor="$brand"
          borderRadius={AVATAR_SIZE / 2}
          height={AVATAR_SIZE}
          justifyContent="center"
          width={AVATAR_SIZE}
        >
          <MessageCircleMore color="white" size={24} strokeWidth={2.2} />
        </YStack>
      </YStack>
    </YStack>
  );
}
