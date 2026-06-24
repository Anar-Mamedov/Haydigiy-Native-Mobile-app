import { Search } from '@tamagui/lucide-icons-2';
import { Input, XStack } from 'tamagui';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

/** Theme-aware search field (icon + borderless input) reused across list screens. */
export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Ara...',
  accessibilityLabel,
}: SearchInputProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      height={46}
      paddingHorizontal="$3"
    >
      <Search color="$color10" size={18} />
      <Input
        accessibilityLabel={accessibilityLabel ?? placeholder}
        backgroundColor="transparent"
        borderWidth={0}
        flex={1}
        fontSize={14}
        onChangeText={onChangeText}
        padding={0}
        placeholder={placeholder}
        placeholderTextColor="$color9"
        value={value}
      />
    </XStack>
  );
}
