import { Pressable } from 'react-native';
import { Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Check, X } from '@/components/ui/icons';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';

export interface SortOption {
  label: string;
  value: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Fiyata Göre Azalan', value: '2' },
  { label: 'Fiyata Göre Artan', value: '4' },
  { label: 'Yeniden Eskiye', value: '5' },
  { label: 'Eskiden Yeniye', value: '6' },
  { label: 'En çok satanlar', value: '9' },
  { label: 'En çok favoriye eklenenler', value: '8' },
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
      <AppSheetOverlay />
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
