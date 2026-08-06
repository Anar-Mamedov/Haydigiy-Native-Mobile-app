import { Pressable } from 'react-native';
import { ArrowLeft } from '@/components/ui/icons';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type OrdersHeaderProps = {
  title: string;
  onBack: () => void;
};

/** Back + centered title bar for the orders screens. */
export function OrdersHeader({ title, onBack }: OrdersHeaderProps) {
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
        {title}
      </Paragraph>
    </XStack>
  );
}
