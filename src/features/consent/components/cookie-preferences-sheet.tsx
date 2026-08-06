import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { AppSwitch } from '@/components/ui/app-switch';
import { ESSENTIAL_CONSENT_SECTION, OPTIONAL_CONSENT_SECTIONS } from '../data/consent-texts';
import type { ConsentPreferences } from '../types/consent.types';

type CookiePreferencesSheetProps = {
  onAcceptAll: () => void;
  onClose: () => void;
  onSave: () => void;
  onToggle: (key: keyof ConsentPreferences) => void;
  open: boolean;
  preferences: ConsentPreferences;
};

/** Web'deki "ÇEREZ YÖNETİM PANELİ" modalinin karşılığı. */
export function CookiePreferencesSheet({
  onAcceptAll,
  onClose,
  onSave,
  onToggle,
  open,
  preferences,
}: CookiePreferencesSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={(next: boolean) => !next && onClose()}
      open={open}
      snapPoints={[85]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        testID="cookie-preferences-sheet"
      >
        <YStack flex={1} gap="$3" padding="$4" paddingBottom={Math.max(insets.bottom, 16)}>
          <Paragraph color="$color" fontSize={16} fontWeight="800">
            ÇEREZ YÖNETİM PANELİ
          </Paragraph>

          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack gap="$3" paddingBottom="$3">
              <YStack backgroundColor="$color2" borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$2" padding="$3">
                <XStack alignItems="center" gap="$2" justifyContent="space-between">
                  <Paragraph color="$color" flex={1} fontSize={14} fontWeight="700">
                    {ESSENTIAL_CONSENT_SECTION.title}
                  </Paragraph>
                  <Paragraph
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$3"
                    borderWidth={1}
                    color="$color10"
                    fontSize={11}
                    fontWeight="600"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    {ESSENTIAL_CONSENT_SECTION.badge}
                  </Paragraph>
                </XStack>
                <Paragraph color="$color11" fontSize={12} lineHeight={18}>
                  {ESSENTIAL_CONSENT_SECTION.body}
                </Paragraph>
              </YStack>

              {OPTIONAL_CONSENT_SECTIONS.map((section) => (
                <YStack
                  borderColor="$borderColor"
                  borderRadius="$4"
                  borderWidth={1}
                  gap="$2"
                  key={section.key}
                  padding="$3"
                >
                  <XStack alignItems="center" gap="$3" justifyContent="space-between">
                    <Paragraph color="$color" flex={1} fontSize={14} fontWeight="700">
                      {section.title}
                    </Paragraph>
                    <AppSwitch
                      accessibilityLabel={`${section.title} tercihini değiştir`}
                      onValueChange={() => onToggle(section.key)}
                      testID={`consent-toggle-${section.key}`}
                      value={preferences[section.key]}
                    />
                  </XStack>
                  <Paragraph color="$color11" fontSize={12} lineHeight={18}>
                    {section.body}
                  </Paragraph>
                </YStack>
              ))}
            </YStack>
          </ScrollView>

          <YStack gap="$2">
            <AppButton
              backgroundColor="$brand"
              borderColor="transparent"
              color="white"
              onPress={onSave}
              pressStyle={{ opacity: 0.85 }}
              testID="consent-save-selection"
            >
              Seçimlerimi Kaydet
            </AppButton>
            <AppButton
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderWidth={1}
              color="$color"
              onPress={onAcceptAll}
              testID="consent-preferences-accept-all"
            >
              Hepsini Kabul Et
            </AppButton>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
