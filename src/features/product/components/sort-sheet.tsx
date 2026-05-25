import { Pressable } from 'react-native';
import { Sheet, XStack, YStack, Paragraph } from 'tamagui';
import { Check, X } from '@tamagui/lucide-icons-2';

export interface SortOption {
  label: string;
  value: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Fiyata Göre Azalan', value: '2' },
  { label: 'Fiyata Göre Artan', value: '4' },
  { label: 'Yeniden Eskiye', value: '5' },
  { label: 'Eskiden Yeniye', value: '6' },
  { label: 'Önerilen Sıralama', value: '' },
];

interface SortSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function SortSheet({ open, onOpenChange, selectedValue, onSelect }: SortSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      dismissOnOverlayPress
      modal
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={12} borderTopRightRadius={12}>
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingVertical={18}
        >
          <Paragraph fontSize={20} fontWeight="700" color="$color">
            Sıralama
          </Paragraph>
          <Pressable
            accessibilityLabel="Sıralamayı kapat"
            accessibilityRole="button"
            onPress={() => onOpenChange(false)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X size={28} color="$color" />
          </Pressable>
        </XStack>

        <YStack gap={4} padding={20} paddingBottom={28}>
          {SORT_OPTIONS.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <Pressable
                accessibilityLabel={`${option.label} seç`}
                accessibilityRole="button"
                key={option.value || 'recommended'}
                onPress={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
              >
                <XStack
                  alignItems="center"
                  backgroundColor={isSelected ? '#fff4e8' : 'transparent'}
                  borderRadius={6}
                  height={52}
                  justifyContent="space-between"
                  paddingHorizontal={16}
                >
                  <Paragraph fontSize={16} fontWeight="500" color={isSelected ? '$brand' : '$color'}>
                    {option.label}
                  </Paragraph>
                  {isSelected && <Check color="$brand" size={20} />}
                </XStack>
              </Pressable>
            );
          })}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
