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
 * Reusable account menu row mirroring the web "Hesabım" list: a large bare icon,
 * the label, and a trailing chevron inside a soft lavender circle. Used by the
 * "Hesabım" card so every navigable row shares one theme-aware implementation.
 */
export function ProfileMenuRow({ icon, label, onPress }: ProfileMenuRowProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <XStack alignItems="center" gap="$3" paddingVertical="$3">
        <XStack alignItems="center" justifyContent="center" width={32}>
          {icon}
        </XStack>
        <Paragraph color="$color" flex={1} fontSize={15} fontWeight="400">
          {label}
        </Paragraph>
        <XStack
          alignItems="center"
          backgroundColor="$purple3"
          borderRadius={100}
          height={28}
          justifyContent="center"
          width={28}
        >
          <ChevronRight color="$purple10" size={16} />
        </XStack>
      </XStack>
    </Pressable>
  );
}
