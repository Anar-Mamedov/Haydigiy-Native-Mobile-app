import { Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

interface CheckoutUpdatingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * Sipariş tutarı `/order/token` üzerinden güncellenirken ödeme içeriğini örten
 * yarı saydam katman. Seçimler zaten `isCheckoutLocked` ile devre dışı kalıyor;
 * bu katman kullanıcının "ekran kilitlendi / hata mı var" diye düşünmesini önler.
 *
 * `pointerEvents="none"`: katman yalnızca bilgilendirir, dokunuşları yakalamaz.
 * Böylece kullanıcı güncelleme sürerken sayfayı kaydırmaya ve alttaki özet
 * çubuğunu kullanmaya devam edebilir; kilit zaten kontrollerin kendisinde.
 *
 * Örtü ile rozet ayrı katmanlar: saydamlık yalnızca örtüye uygulanır, böylece
 * rozet ve spinner tam opak kalır. Renk `$background` token'ı olduğu için
 * açık/koyu temada kendiliğinden doğru tonu alır.
 */
export function CheckoutUpdatingOverlay({
  visible,
  message = 'Sipariş tutarları güncelleniyor...',
}: CheckoutUpdatingOverlayProps) {
  if (!visible) return null;

  return (
    <YStack
      accessibilityLiveRegion="polite"
      alignItems="center"
      bottom={0}
      justifyContent="center"
      left={0}
      pointerEvents="none"
      position="absolute"
      right={0}
      testID="checkout-updating-overlay"
      top={0}
      zIndex={1}
    >
      <YStack
        backgroundColor="$background"
        bottom={0}
        left={0}
        opacity={0.75}
        position="absolute"
        right={0}
        top={0}
      />
      <XStack
        alignItems="center"
        backgroundColor="$background"
        borderColor="$borderColor"
        borderRadius={1000}
        borderWidth={1}
        gap="$3"
        marginHorizontal="$4"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
      >
        <Spinner color="$brand" size="small" />
        <Paragraph color="$color11" fontSize={13} fontWeight="600">
          {message}
        </Paragraph>
      </XStack>
    </YStack>
  );
}
