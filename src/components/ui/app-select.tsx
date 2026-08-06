import { useMemo, useState } from 'react';
import { Keyboard, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, Search } from '@/components/ui/icons';
import { Input, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { matchesSearch } from '@/utils/search';

export type AppSelectOption = {
  label: string;
  value: string | number;
  /** Optional second row line (e.g. the IBAN under the holder name). */
  description?: string;
};

export interface AppSelectProps {
  value?: string | number | null;
  onValueChange: (value: string | number) => void;
  options: AppSelectOption[];
  placeholder?: string;
  /** Accessible label / sheet title. */
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Shows a search field in the options sheet (for long lists like city/district). */
  searchable?: boolean;
  /** Validation message shown below the field; also turns the border red. */
  errorMessage?: string;
}

/**
 * Theme-aware select control. Renders a tappable field and opens a bottom sheet
 * with the options list, so it works the same in light and dark mode and replaces
 * the web `<Select>` across the return flow (reasons, IBAN, city/district/date).
 */
export function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Seçiniz',
  label,
  disabled,
  loading,
  searchable,
  errorMessage,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const selectedDisplayLabel = selected
    ? selected.description
      ? `${selected.label} - ${selected.description}`
      : selected.label
    : undefined;
  const isDisabled = disabled || loading;

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    return options.filter(
      (option) =>
        matchesSearch(option.label, query) ||
        (option.description ? matchesSearch(option.description, query) : false),
    );
  }, [searchable, query, options]);

  const changeOpen = (next: boolean) => {
    if (next) Keyboard.dismiss();
    setOpen(next);
    if (!next) setQuery('');
  };

  // Size the options sheet to its content (so a 2-item list isn't a tall sheet),
  // capped at 85% of the screen for long/searchable lists, which then scroll.
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // The sheet reaches the physical bottom of the screen (edge-to-edge), so the
  // list needs the safe-area inset to keep the last option above the system
  // navigation bar / home indicator.
  const listBottomPadding = Math.max(insets.bottom, 16) + 16;
  const sheetHeaderHeight = 64 + (searchable ? 56 : 0);
  // Row heights are deterministic on every device: each text line is a single
  // ellipsized line, so a row is 50pt — or 68pt when it has a description
  // line — with no text-wrap guessing.
  const describedOptionCount = options.filter((option) => option.description).length;
  const estimatedHeight =
    sheetHeaderHeight +
    (options.length - describedOptionCount) * 50 +
    describedOptionCount * 68 +
    8 +
    listBottomPadding;
  const sheetHeight = Math.min(Math.round(windowHeight * 0.85), Math.max(estimatedHeight, 140));

  return (
    <>
      <XStack
        accessibilityLabel={label ?? placeholder}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(isDisabled), expanded: open }}
        alignItems="center"
        backgroundColor="$background"
        borderColor={errorMessage ? '$red8' : '$borderColor'}
        borderRadius="$4"
        borderWidth={1}
        disabled={isDisabled}
        gap="$2"
        height={46}
        justifyContent="space-between"
        onPress={() => !isDisabled && changeOpen(true)}
        opacity={isDisabled ? 0.6 : 1}
        paddingHorizontal="$3"
        pressStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <Paragraph
          color={selected ? '$color' : '$color9'}
          flex={1}
          fontSize={14}
          numberOfLines={1}
        >
          {loading ? 'Yükleniyor...' : (selectedDisplayLabel ?? placeholder)}
        </Paragraph>
        {loading ? <Spinner color="$brand" size="small" /> : <ChevronDown color="$color9" size={18} />}
      </XStack>

      {errorMessage ? (
        <Paragraph color="$red10" fontSize={12} marginTop="$1.5">
          {errorMessage}
        </Paragraph>
      ) : null}

      <Sheet
        dismissOnOverlayPress
        dismissOnSnapToBottom
        modal
        moveOnKeyboardChange
        onOpenChange={changeOpen}
        open={open}
        snapPoints={[sheetHeight]}
        snapPointsMode="constant"
      >
        <AppSheetOverlay />
        <Sheet.Frame
          backgroundColor="$background"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
        >
          <YStack
            borderBottomColor="$borderColor"
            borderBottomWidth={1}
            gap="$3"
            padding="$4"
          >
            <Paragraph color="$color" fontSize={16} fontWeight="700">
              {label ?? placeholder}
            </Paragraph>
            {searchable ? (
              <XStack
                alignItems="center"
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                borderRadius="$4"
                borderWidth={1}
                gap="$2"
                paddingHorizontal="$3"
              >
                <Search color="$color9" size={18} />
                <Input
                  accessibilityLabel="Ara"
                  autoCapitalize="none"
                  backgroundColor="transparent"
                  borderWidth={0}
                  flex={1}
                  fontSize={14}
                  height={42}
                  onChangeText={setQuery}
                  paddingHorizontal={0}
                  placeholder="Ara..."
                  value={query}
                />
              </XStack>
            ) : null}
          </YStack>
          <KeyboardAwareSheetScrollView
            contentContainerStyle={{ padding: 8, paddingBottom: listBottomPadding }}
            testID="app-select-options-scroll"
          >
            {filteredOptions.length === 0 ? (
              <Paragraph color="$color9" fontSize={14} padding="$4" textAlign="center">
                Sonuç bulunamadı
              </Paragraph>
            ) : null}
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <XStack
                  accessibilityLabel={
                    option.description ? `${option.label} - ${option.description}` : option.label
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  alignItems="center"
                  backgroundColor={isSelected ? '$backgroundHover' : 'transparent'}
                  borderRadius="$3"
                  gap="$2"
                  justifyContent="space-between"
                  key={String(option.value)}
                  onPress={() => {
                    onValueChange(option.value);
                    changeOpen(false);
                  }}
                  padding="$3"
                  pressStyle={{ backgroundColor: '$backgroundHover' }}
                >
                  <YStack flex={1}>
                    <Paragraph
                      color={isSelected ? '$brand' : '$color'}
                      fontSize={14}
                      fontWeight={isSelected ? '700' : '400'}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Paragraph>
                    {option.description ? (
                      <Paragraph
                        color={isSelected ? '$brand' : '$color10'}
                        fontSize={13}
                        numberOfLines={1}
                      >
                        {option.description}
                      </Paragraph>
                    ) : null}
                  </YStack>
                  {isSelected ? <Check color="$brand" size={18} /> : null}
                </XStack>
              );
            })}
          </KeyboardAwareSheetScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
