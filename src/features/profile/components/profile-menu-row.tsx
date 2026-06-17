import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';

type ProfileMenuRowProps = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

/**
 * Reusable account menu row: leading icon, label and a trailing chevron. Used by
 * the "Size Özel" and "Hesabım & Yardım" cards so every navigable row shares one
 * theme-aware, accessible implementation.
 */
export function ProfileMenuRow({ icon, label, onPress }: ProfileMenuRowProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <XStack alignItems="center" gap="$3" paddingVertical="$2.5">
        <XStack alignItems="center" justifyContent="center" width={24}>
          {icon}
        </XStack>
        <Paragraph color="$color" flex={1} fontSize={14} fontWeight="500">
          {label}
        </Paragraph>
        <ChevronRight color="$color9" size={20} />
      </XStack>
    </Pressable>
  );
}
