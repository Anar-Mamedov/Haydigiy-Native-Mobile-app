import { Pressable } from 'react-native';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronDown } from '@/components/ui/icons';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onPress: () => void;
}

export function FilterPill({ label, isActive, isOpen, onPress }: FilterPillProps) {
  const highlighted = isActive || isOpen;

  return (
    <Pressable
      accessibilityLabel={`${label} filtresi`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen, selected: isActive }}
      onPress={onPress}
    >
      {({ pressed }) => (
        <XStack
          alignItems="center"
          backgroundColor="$background"
          borderColor={highlighted ? '$brand' : '$borderColor'}
          borderRadius={20}
          borderWidth={1}
          gap={6}
          height={32}
          justifyContent="center"
          opacity={pressed ? 0.8 : 1}
          paddingHorizontal={12}
        >
          <Paragraph fontSize={12} fontWeight={highlighted ? '700' : '500'} color={highlighted ? '$brand' : '$color'}>
            {label}
          </Paragraph>
          <ChevronDown
            size={12}
            color={highlighted ? '$brand' : '$color10'}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </XStack>
      )}
    </Pressable>
  );
}
