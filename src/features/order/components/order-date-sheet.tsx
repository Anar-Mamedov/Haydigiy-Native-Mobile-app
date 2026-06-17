import { Pressable } from 'react-native';
import { Check } from '@tamagui/lucide-icons-2';
import { Paragraph, Sheet, XStack, YStack } from 'tamagui';
import { OrderDateFilter } from '@/types/order.types';

export const ORDER_DATE_OPTIONS: { label: string; value: OrderDateFilter }[] = [
  { label: 'Tüm Tarihler', value: 'all' },
  { label: 'Son 30 Gün', value: 'last_30_days' },
  { label: 'Son 6 Ay', value: 'last_6_months' },
  { label: 'Son 1 Yıl', value: 'last_1_year' },
];

export function orderDateLabel(value: OrderDateFilter): string {
  return ORDER_DATE_OPTIONS.find((option) => option.value === value)?.label ?? 'Tüm Tarihler';
}

type OrderDateSheetProps = {
  open: boolean;
  value: OrderDateFilter;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: OrderDateFilter) => void;
};

/** Bottom-sheet picker for the order date filter, replacing the web's dropdown. */
export function OrderDateSheet({ open, value, onOpenChange, onSelect }: OrderDateSheetProps) {
  return (
    <Sheet
      dismissOnSnapToBottom
      dismissOnOverlayPress
      modal
      onOpenChange={onOpenChange}
      open={open}
      snapPointsMode="fit"
    >
      <Sheet.Overlay
        backgroundColor="$shadowColor"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
      />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        paddingBottom="$6"
      >
        <YStack padding="$4" gap="$1">
          <Paragraph color="$color" fontSize={16} fontWeight="700" marginBottom="$2">
            Tarih Filtresi
          </Paragraph>
          {ORDER_DATE_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <XStack alignItems="center" justifyContent="space-between" paddingVertical="$3">
                  <Paragraph
                    color={selected ? '$brand' : '$color'}
                    fontSize={15}
                    fontWeight={selected ? '700' : '500'}
                  >
                    {option.label}
                  </Paragraph>
                  {selected ? <Check color="$brand" size={18} /> : null}
                </XStack>
              </Pressable>
            );
          })}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
