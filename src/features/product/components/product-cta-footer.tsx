import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paragraph, XStack } from 'tamagui';

type ProductCtaFooterProps = {
  /** Outline (secondary) action on the left, e.g. "Soru & Cevap" or "Soru Sor". */
  leftLabel: string;
  onLeftPress: () => void;
  /** Filled primary action on the right (defaults to "Sepete Ekle"). */
  rightLabel?: string;
  onRightPress: () => void;
};

/** Sticky bottom action bar used by the reviews and Q&A screens. */
export function ProductCtaFooter({
  leftLabel,
  onLeftPress,
  rightLabel = 'Sepete Ekle',
  onRightPress,
}: ProductCtaFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <XStack
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      bottom={0}
      gap="$3"
      left={0}
      paddingBottom={Math.max(insets.bottom, 12)}
      paddingHorizontal="$4"
      paddingTop="$3"
      position="absolute"
      right={0}
    >
      <XStack
        accessibilityLabel={leftLabel}
        accessibilityRole="button"
        alignItems="center"
        borderColor="$brand"
        borderRadius="$4"
        borderWidth={2}
        flex={1}
        height={48}
        justifyContent="center"
        onPress={onLeftPress}
        pressStyle={{ opacity: 0.7 }}
      >
        <Paragraph color="$brand" fontSize={14} fontWeight="700">
          {leftLabel}
        </Paragraph>
      </XStack>
      <XStack
        accessibilityLabel={rightLabel}
        accessibilityRole="button"
        alignItems="center"
        backgroundColor="$brand"
        borderRadius="$4"
        flex={1}
        height={48}
        justifyContent="center"
        onPress={onRightPress}
        pressStyle={{ opacity: 0.85 }}
      >
        <Paragraph color="white" fontSize={14} fontWeight="700">
          {rightLabel}
        </Paragraph>
      </XStack>
    </XStack>
  );
}
