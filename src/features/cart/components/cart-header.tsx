import { Pressable } from 'react-native';
import { ArrowLeft } from '@/components/ui/icons';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type CartHeaderProps = {
  itemCount: number;
  canClear: boolean;
  onBack: () => void;
  onClear: () => void;
};

/**
 * Cart screen top bar: back navigation, centered "Sepetim (n)" title and a
 * destructive "Sepeti Temizle" action that disables itself on an empty cart.
 */
export function CartHeader({ itemCount, canClear, onBack, onClear }: CartHeaderProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      height={56}
      justifyContent="center"
      paddingHorizontal="$4"
      position="relative"
      width="100%"
    >
      <XStack left={8} position="absolute" zIndex={10}>
        <Pressable
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        >
          <ArrowLeft color="$color" size={24} />
        </Pressable>
      </XStack>

      <Paragraph color="$color" fontSize={16} fontWeight="700">
        Sepetim ({itemCount})
      </Paragraph>

      <XStack position="absolute" right={12} zIndex={10}>
        <Pressable
          accessibilityLabel="Sepeti temizle"
          accessibilityRole="button"
          disabled={!canClear}
          hitSlop={8}
          onPress={onClear}
          style={({ pressed }) => ({
            opacity: !canClear ? 0.4 : pressed ? 0.6 : 1,
            padding: 4,
          })}
        >
          <Paragraph color="$red10" fontSize={12} fontWeight="700">
            Sepeti Temizle
          </Paragraph>
        </Pressable>
      </XStack>
    </XStack>
  );
}
