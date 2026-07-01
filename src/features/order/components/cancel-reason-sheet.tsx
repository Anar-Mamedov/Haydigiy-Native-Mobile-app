import { Pressable } from 'react-native';
import { Check } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { CancellationReason } from '@/types/order.types';

type CancelReasonSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasons: CancellationReason[];
  selectedReasonId?: number;
  onSelect: (reasonId: number) => void;
};

/** Bottom-sheet picker for an item's cancellation reason. */
export function CancelReasonSheet({
  open,
  onOpenChange,
  reasons,
  selectedReasonId,
  onSelect,
}: CancelReasonSheetProps) {
  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={onOpenChange}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6" paddingBottom="$6">
        <YStack padding="$4" gap="$1">
          <Paragraph color="$color" fontSize={16} fontWeight="700" marginBottom="$2">
            İptal Nedeni Seçin
          </Paragraph>
          <ScrollView style={{ maxHeight: 360 }}>
            {reasons.map((reason) => {
              const selected = reason.id === selectedReasonId;
              return (
                <Pressable
                  accessibilityLabel={reason.name}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={reason.id}
                  onPress={() => {
                    onSelect(reason.id);
                    onOpenChange(false);
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <XStack alignItems="center" justifyContent="space-between" paddingVertical="$3">
                    <Paragraph
                      color={selected ? '$brand' : '$color'}
                      flex={1}
                      fontSize={15}
                      fontWeight={selected ? '700' : '500'}
                    >
                      {reason.name}
                    </Paragraph>
                    {selected ? <Check color="$brand" size={18} /> : null}
                  </XStack>
                </Pressable>
              );
            })}
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
