import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';

export interface AppCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel: string;
  /** Label content rendered next to the box (text, links, etc.). */
  children?: ReactNode;
  size?: number;
  /** Blocks toggling and dims the control while an owning flow is busy. */
  disabled?: boolean;
}

/**
 * Shared interactive checkbox: a pressable, theme-aware box plus an optional
 * label area. Used for consent/KVKK checkboxes across the auth forms so the
 * control is defined once instead of being re-implemented per screen.
 */
export function AppCheckbox({ checked, onChange, accessibilityLabel, children, size = 24, disabled = false }: AppCheckboxProps) {
  return (
    <XStack gap="$3" alignItems="flex-start" opacity={disabled ? 0.6 : 1}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onChange(!checked)}
        hitSlop={8}
      >
        <FilterCheckbox checked={checked} size={size} />
      </Pressable>
      {children ? <YStack flex={1}>{children}</YStack> : null}
    </XStack>
  );
}
