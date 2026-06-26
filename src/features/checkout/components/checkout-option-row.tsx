import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

interface CheckoutOptionRowProps {
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  /** Main row content (label, logo, etc.). */
  children: ReactNode;
  /** Optional trailing content (price, badge). */
  right?: ReactNode;
}

/** A theme-aware radio circle that stays visible/contrasted in light and dark. */
function RadioMark({ selected, disabled }: { selected: boolean; disabled?: boolean }) {
  return (
    <YStack
      alignItems="center"
      borderColor={selected ? '$brand' : '$color8'}
      borderRadius={1000}
      borderWidth={2}
      height={20}
      justifyContent="center"
      opacity={disabled ? 0.4 : 1}
      width={20}
    >
      {selected ? (
        <YStack backgroundColor="$brand" borderRadius={1000} height={10} width={10} />
      ) : null}
    </YStack>
  );
}

/**
 * Selectable row with a leading radio mark, shared by the cargo, payment-method
 * and installment lists so the radio styling/contrast is defined once.
 */
export function CheckoutOptionRow({
  selected,
  onPress,
  disabled,
  accessibilityLabel,
  children,
  right,
}: CheckoutOptionRowProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
    >
      <XStack
        alignItems="center"
        gap="$3"
        opacity={disabled ? 0.6 : 1}
        paddingHorizontal="$3.5"
        paddingVertical="$3"
      >
        <RadioMark disabled={disabled} selected={selected} />
        <XStack alignItems="center" flex={1} gap="$2" justifyContent="space-between">
          <XStack alignItems="center" flex={1} gap="$2.5">
            {children}
          </XStack>
          {right}
        </XStack>
      </XStack>
    </Pressable>
  );
}
