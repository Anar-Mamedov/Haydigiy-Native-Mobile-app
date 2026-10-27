import { MIN_TOUCH_TARGET, getTextFieldLabelProps } from '@/components/ui';
import { Search } from '@/components/ui/icons';
import { Input, XStack } from 'tamagui';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';

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
      paddingHorizontal="$3"
    >
      <Search color="$color10" size={18} />
      <Input
        {...getTextFieldLabelProps({ label: 'Yardım sayfasında ara', placeholder })}
        backgroundColor="transparent"
        borderWidth={0}
        flex={1}
        fontSize={14}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        minHeight={MIN_TOUCH_TARGET}
        onChangeText={onChangeText}
        padding={0}
        placeholder={placeholder}
        placeholderTextColor="$color9"
        value={value}
      />
    </XStack>
  );
}
