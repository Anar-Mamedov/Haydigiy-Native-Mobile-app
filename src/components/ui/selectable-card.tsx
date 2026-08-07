import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type SelectableCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

/**
 * A tappable option card used for single-choice groups (return cargo method,
 * refund method, …). Text colors are set explicitly here so the title and
 * description stay readable in both light and dark themes.
 */
export function SelectableCard({
  title,
  description,
  selected,
  onPress,
  disabled = false,
  testID,
}: SelectableCardProps) {
  return (
    <YStack
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      backgroundColor={selected ? '$backgroundHover' : '$background'}
      borderColor={selected ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$1"
      onPress={() => {
        if (!disabled) onPress();
      }}
      opacity={disabled ? 0.6 : 1}
      padding="$3"
      pressStyle={disabled ? undefined : { opacity: 0.9 }}
      testID={testID}
    >
      <Paragraph color="$color" fontSize={14} fontWeight="700">
        {title}
      </Paragraph>
      {description ? (
        <Paragraph color="$color10" fontSize={12}>
          {description}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
