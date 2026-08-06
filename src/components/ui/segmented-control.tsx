import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Theme-aware segmented control (e.g. Bireysel / Kurumsal). The active segment's
 * brand colouring and the inactive segments' text colour are enforced inside the
 * component so screens never have to patch contrast for light/dark themes, and
 * each segment keeps an equal share of the row width.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <XStack
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      opacity={disabled ? 0.6 : 1}
      overflow="hidden"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <XStack
            accessibilityLabel={option.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: Boolean(disabled), selected: active }}
            alignItems="center"
            backgroundColor={active ? '$orange3' : '$background'}
            disabled={disabled}
            flex={1}
            height={44}
            justifyContent="center"
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            pressStyle={disabled ? undefined : { opacity: 0.85 }}
          >
            <Paragraph color={active ? '$brand' : '$color'} fontSize={14} fontWeight="700">
              {option.label}
            </Paragraph>
          </XStack>
        );
      })}
    </XStack>
  );
}
