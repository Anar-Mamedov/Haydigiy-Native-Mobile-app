import { ComponentProps, ReactNode } from 'react';
import { AccessibilityActionEvent, AccessibilityActionInfo, Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

const ACTIVATE_ACTION = 'activate';

interface CheckoutOptionRowProps {
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  /** Main row content (label, logo, etc.). */
  children: ReactNode;
  /** Optional trailing content (price, badge). */
  right?: ReactNode;
  paddingVertical?: ComponentProps<typeof XStack>['paddingVertical'];
  /**
   * Extra screen-reader actions for pressable content nested in the row (e.g. a map link).
   * The row is a single accessibility element, so nested links are otherwise unreachable.
   */
  accessibilityActions?: AccessibilityActionInfo[];
  /** Receives the name of an extra action; `activate` always selects the row. */
  onAccessibilityAction?: (actionName: string) => void;
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
  paddingVertical = '$3',
  accessibilityActions,
  onAccessibilityAction,
}: CheckoutOptionRowProps) {
  const hasExtraActions = Boolean(accessibilityActions?.length);

  // With custom actions declared, activation is handled here explicitly: the platform's
  // fallback taps the row's centre, which could land on a nested link instead.
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    const { actionName } = event.nativeEvent;
    if (actionName === ACTIVATE_ACTION) {
      if (!disabled) onPress();
      return;
    }
    onAccessibilityAction?.(actionName);
  };

  return (
    <Pressable
      accessibilityActions={
        hasExtraActions ? [{ name: ACTIVATE_ACTION }, ...(accessibilityActions ?? [])] : undefined
      }
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      onAccessibilityAction={hasExtraActions ? handleAccessibilityAction : undefined}
      onPress={onPress}
    >
      <XStack
        alignItems="center"
        gap="$3"
        opacity={disabled ? 0.6 : 1}
        paddingHorizontal="$3.5"
        paddingVertical={paddingVertical}
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
