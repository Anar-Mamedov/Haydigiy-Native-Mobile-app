import { usePathname, useRouter, type Href } from 'expo-router';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { MessageCircle } from '@/components/ui/icons';
import { useAssistantAvailability } from '../hooks/use-assistant-availability';

/**
 * Sağ-alt "Haydi Asistan" düğmesi. Yalnız seçili ana ekranlarda görünür (ürün listesinin "başa dön"
 * düğmesi, sepet ve form ekranlarıyla çakışmasın diye). `/config` kapalıysa (enabled:false, eski istemci
 * ya da 403) hiç çizilmez (kural 13).
 */
const VISIBLE_ON_PATHS: ReadonlySet<string> = new Set(['/', '/categories', '/help', '/orders']);
/** Yazılı rota tipleri `expo start`'ta yeniden üretilir; yeni rota o zamana kadar `Href` olarak verilir. */
export const ASSISTANT_ROUTE = '/assistant' as Href;

const AVATAR_SIZE = 40;

const normalizePathname = (pathname: string) => pathname.replace(/^\/\(tabs\)/, '') || '/';

export function AssistantLauncher() {
  const router = useRouter();
  const pathname = normalizePathname(usePathname());
  const { available, config } = useAssistantAvailability();

  if (!available || !config || !VISIBLE_ON_PATHS.has(pathname)) return null;

  return (
    <XStack bottom="$4" position="absolute" right="$4" zIndex={30}>
      <XStack
        accessibilityLabel={config.texts.open_label}
        accessibilityRole="button"
        alignItems="center"
        backgroundColor="$color12"
        borderRadius="$10"
        elevation={6}
        gap="$2"
        minHeight={MIN_TOUCH_TARGET}
        onPress={() => router.push(ASSISTANT_ROUTE)}
        padding="$1.5"
        paddingRight="$3.5"
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        shadowColor="$shadowColor"
        shadowOffset={{ height: 4, width: 0 }}
        shadowOpacity={0.25}
        shadowRadius={10}
        testID="assistant-launcher"
      >
        <YStack
          alignItems="center"
          backgroundColor="$brand"
          borderRadius={AVATAR_SIZE / 2}
          height={AVATAR_SIZE}
          justifyContent="center"
          width={AVATAR_SIZE}
        >
          <MessageCircle color="white" size={22} />
        </YStack>
        <Paragraph color="$color1" fontSize={14} fontWeight="700">
          {config.texts.launcher_label}
        </Paragraph>
      </XStack>
    </XStack>
  );
}
