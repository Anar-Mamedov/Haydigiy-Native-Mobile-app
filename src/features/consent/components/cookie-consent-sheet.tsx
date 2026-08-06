import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Sheet, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { CONSENT_BANNER_BODY, CONSENT_BANNER_TITLE } from '../data/consent-texts';

type CookieConsentSheetProps = {
  onAcceptAll: () => void;
  onOpenPreferences: () => void;
  onRejectAll: () => void;
  open: boolean;
};

/**
 * İlk açılışta gösterilen izin bildirimi. Web'deki alt banner'ın karşılığı.
 * Kapatılamaz: kullanıcı üç seçenekten birini seçmeden kapanmıyor.
 */
export function CookieConsentSheet({
  onAcceptAll,
  onOpenPreferences,
  onRejectAll,
  open,
}: CookieConsentSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet disableDrag modal open={open} snapPointsMode="fit">
      <AppSheetOverlay />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        testID="cookie-consent-sheet"
      >
        <YStack gap="$3" padding="$4" paddingBottom={Math.max(insets.bottom, 16)}>
          <Paragraph color="$color" fontSize={16} fontWeight="800">
            {CONSENT_BANNER_TITLE}
          </Paragraph>

          {/* Metin uzun; küçük ekranda sheet'i taşırmaması için kendi içinde kayıyor. */}
          <ScrollView maxHeight={220} showsVerticalScrollIndicator={false}>
            <Paragraph color="$color11" fontSize={13} lineHeight={19}>
              {CONSENT_BANNER_BODY}
            </Paragraph>
          </ScrollView>

          <YStack gap="$2">
            <AppButton
              backgroundColor="$brand"
              borderColor="transparent"
              color="white"
              onPress={onAcceptAll}
              pressStyle={{ opacity: 0.85 }}
              testID="consent-accept-all"
            >
              Hepsini Kabul Et
            </AppButton>
            <AppButton
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderWidth={1}
              color="$color"
              onPress={onOpenPreferences}
              testID="consent-open-preferences"
            >
              Çerez Ayarlarını Yapılandır
            </AppButton>
            <AppButton
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderWidth={1}
              color="$color"
              onPress={onRejectAll}
              testID="consent-reject-all"
            >
              Hepsini Reddet
            </AppButton>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
