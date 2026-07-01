import { Pressable } from 'react-native';
import { Paragraph, ScrollView, Sheet, XStack } from 'tamagui';
import { X } from '@tamagui/lucide-icons-2';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';

export interface DisclosureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  text?: string;
}

/**
 * Shared bottom sheet for long legal/disclosure text (KVKK, commercial consent,
 * etc.). Defined once so screens reuse the same themed modal instead of
 * duplicating the Sheet structure.
 */
export function DisclosureSheet({ open, onOpenChange, title, text }: DisclosureSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      dismissOnOverlayPress
      modal
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$5"
          paddingVertical="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Paragraph fontSize={18} fontWeight="700" color="$color">
            {title}
          </Paragraph>
          <Pressable
            accessibilityLabel="Kapat"
            accessibilityRole="button"
            onPress={() => onOpenChange(false)}
            hitSlop={8}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X size={24} color="$color" />
          </Pressable>
        </XStack>
        <ScrollView padding="$5">
          <Paragraph size="$3" color="$color10" lineHeight="$5" whiteSpace="pre-line" paddingBottom="$8">
            {text}
          </Paragraph>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
