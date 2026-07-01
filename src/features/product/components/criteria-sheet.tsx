import { Pressable } from 'react-native';
import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, Sheet, XStack, YStack } from 'tamagui';
import { AppButton, AppSheetOverlay } from '@/components/ui';

type CriteriaSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;
  criteria: string[];
};

/** Bottom sheet listing publishing criteria (reused by reviews and Q&A). */
export function CriteriaSheet({ open, onClose, title, intro, criteria }: CriteriaSheetProps) {
  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={(next: boolean) => !next && onClose()}
      open={open}
      snapPoints={[60]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingBottom="$3"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph color="$color" fontSize={15} fontWeight="800">
            {title}
          </Paragraph>
          <Pressable accessibilityLabel="Kapat" accessibilityRole="button" hitSlop={8} onPress={onClose}>
            <X color="$color" size={22} />
          </Pressable>
        </XStack>

        <YStack flex={1} gap="$2" padding="$4">
          <Paragraph color="$color11" fontSize={12} lineHeight={18}>
            {intro}
          </Paragraph>
          <Paragraph color="$color" fontSize={13} fontWeight="700" marginTop="$2">
            Uygunluk Kriterleri
          </Paragraph>
          {criteria.map((item) => (
            <Paragraph color="$color11" fontSize={12} key={item} lineHeight={18}>
              • {item}
            </Paragraph>
          ))}
        </YStack>

        <YStack borderTopColor="$borderColor" borderTopWidth={1} padding="$4">
          <AppButton backgroundColor="$brand" borderColor="transparent" color="white" onPress={onClose}>
            Kapat
          </AppButton>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
