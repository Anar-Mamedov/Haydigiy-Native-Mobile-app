import { Search } from '@tamagui/lucide-icons-2';
import { Input, XStack } from 'tamagui';

type HelpSearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** Theme-aware search field for filtering help articles by question. */
export function HelpSearchInput({
  value,
  onChangeText,
  placeholder = 'Yardım sayfasında ara...',
}: HelpSearchInputProps) {
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
        accessibilityLabel="Yardım sayfasında ara"
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
