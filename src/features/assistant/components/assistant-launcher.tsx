import { usePathname, useRouter, type Href } from 'expo-router';
import { YStack } from 'tamagui';
import { MessageCircleMore } from '@/components/ui/icons';
import { useAssistantAvailability } from '../hooks/use-assistant-availability';

/**
 * Sağ-alt "Haydi Asistan" düğmesi. Yalnız seçili ana ekranlarda görünür (ürün listesinin "başa dön"
 * düğmesi, sepet ve form ekranlarıyla çakışmasın diye). `/config` kapalıysa (enabled:false, eski istemci
 * ya da 403) hiç çizilmez (kural 13).
 */
const VISIBLE_ON_PATHS: ReadonlySet<string> = new Set(['/', '/categories', '/help', '/orders']);
/** Yazılı rota tipleri `expo start`'ta yeniden üretilir; yeni rota o zamana kadar `Href` olarak verilir. */
export const ASSISTANT_ROUTE = '/assistant' as Href;

/**
 * Mobil web düğmesiyle aynı görünüm (frontend `AssistantLauncher.tsx`, <768 px): yazısız, 56 px koyu daire
 * içinde 44 px turuncu daire ve 24 px simge. Ekran okuyucu `open_label`'ı okur.
 */
const BUTTON_SIZE = 56;
const AVATAR_SIZE = 44;

const normalizePathname = (pathname: string) => pathname.replace(/^\/\(tabs\)/, '') || '/';

export function AssistantLauncher() {
  const router = useRouter();
  const pathname = normalizePathname(usePathname());
  const { available, config } = useAssistantAvailability();

  if (!available || !config || !VISIBLE_ON_PATHS.has(pathname)) return null;

  return (
    <YStack bottom="$4" position="absolute" right="$4" zIndex={30}>
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
