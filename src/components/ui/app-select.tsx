import { useMemo, useState } from 'react';
import { Keyboard, LayoutChangeEvent } from 'react-native';
import { Check, ChevronDown, Search, X } from '@/components/ui/icons';
import { Button, ColorTokens, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { AppInput } from '@/components/ui/app-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { SheetSwipeCloseArea } from '@/components/ui/sheet-swipe-close-area';
import { useFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { matchesSearch } from '@/utils/search';

/** `AppInput` ile aynı kalıp (Tamagui `$4` boyutu = 44, `$6` köşe); formda ikisi tek aile görünsün. */
const FIELD_HEIGHT = 44;

/** Arama alanı: görünür etiket yok (placeholder + ikon yeterli), `AppInput` erişilebilir etiketi taşır. */
function SearchField({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <YStack>
      <AppInput
        autoCapitalize="none"
        autoCorrect={false}
        backgroundColor="$backgroundHover"
        borderRadius="$4"
        fontSize={14}
        height={42}
        hideVisibleLabel
        label={label}
        onChangeText={onChangeText}
        paddingLeft={36}
        placeholder="Ara..."
        value={value}
      />
      <XStack
        alignItems="center"
        bottom={0}
        left={12}
        pointerEvents="none"
        position="absolute"
        top={0}
      >
        <Search color="$color9" size={18} />
      </XStack>
    </YStack>
  );
}

/**
 * Fit modundaki sheet içeriğe göre boylanır; arama sonuçları azaldıkça sheet (ve yazılan arama
 * alanı) aşağı zıplamasın diye liste, aramasız açıldığı yükseklikte tutulur. Kapanınca sıfırlanır
 * ki sonraki açılış (ör. il değişince yeni ilçe listesi) kendi yüksekliğini ölçsün.
 */
function useSearchStableListHeight(enabled: boolean, query: string) {
  const [minHeight, setMinHeight] = useState<number>();

  const onLayout = (event: LayoutChangeEvent) => {
    if (enabled && !query) setMinHeight(event.nativeEvent.layout.height);
  };

  return {
    minHeight: enabled ? minHeight : undefined,
    onLayout,
    reset: () => setMinHeight(undefined),
  };
}

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
  /**
   * Shows an × button that empties the field while a value is selected, like the
   * web `<Select allowClear>`. Leave it out for selects that must keep a value.
   */
  onClear?: () => void;
  /**
   * Alan zemini; varsayılan `$background`. Formdaki `AppInput`'lara farklı bir zemin
   * verildiyse (ör. profilde `$color1`) aynısı verilir ki seçim kutusu ayrı durmasın.
   */
  backgroundColor?: ColorTokens;
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
  onClear,
  backgroundColor = '$background',
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const maxHeight = useFitSheetMaxHeight();
  const listHeight = useSearchStableListHeight(Boolean(searchable), query);
  const title = label ?? placeholder;
  const selected = options.find((option) => option.value === value);
  const selectedDisplayLabel = selected
    ? selected.description
      ? `${selected.label} - ${selected.description}`
      : selected.label
    : undefined;
  const isDisabled = disabled || loading;
  const canClear = Boolean(onClear && selected && !isDisabled);

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
    if (!next) {
      setQuery('');
      listHeight.reset();
    }
  };
  const close = () => changeOpen(false);

  return (
    <>
      <YStack position="relative">
        <XStack
          accessibilityLabel={title}
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(isDisabled), expanded: open }}
          alignItems="center"
          backgroundColor={backgroundColor}
          borderColor={errorMessage ? '$red8' : '$borderColor'}
          borderRadius="$6"
          borderWidth={1}
          disabled={isDisabled}
          gap="$2"
          height={FIELD_HEIGHT}
          justifyContent="space-between"
          onPress={() => !isDisabled && changeOpen(true)}
          opacity={isDisabled ? 0.6 : 1}
          paddingHorizontal="$3"
          // The × takes the chevron's place (like the web's `allowClear`), so narrow
          // fields such as the day keep room for the selected value.
          paddingRight={canClear ? 40 : undefined}
          // Açık temada beyaz zeminin "hover" rengi de beyaz; hafif saydamlık her zeminde geri bildirim verir.
          pressStyle={{ backgroundColor: '$backgroundHover', opacity: 0.85 }}
        >
          <Paragraph
            color={selected ? '$color' : '$color9'}
            flex={1}
            fontSize={14}
            numberOfLines={1}
          >
            {loading ? 'Yükleniyor...' : (selectedDisplayLabel ?? placeholder)}
          </Paragraph>
          {loading ? (
            <Spinner color="$brand" size="small" />
          ) : canClear ? null : (
            <ChevronDown color="$color9" size={18} testID="app-select-chevron" />
          )}
        </XStack>

        {/* A sibling of the field rather than a child: pressing it must not open the
            sheet, and screen readers reach it as its own control. */}
        {canClear ? (
          <XStack alignItems="center" bottom={0} position="absolute" right={6} top={0}>
            <Button
              accessibilityLabel={`${title} seçimini kaldır`}
              accessibilityRole="button"
              chromeless
              circular
              hitSlop={8}
              icon={<X color="$color9" size={16} />}
              onPress={onClear}
              padding={0}
              size="$2"
            />
          </XStack>
        ) : null}
      </YStack>

      {errorMessage ? (
        <Paragraph color="$red10" fontSize={12} marginTop="$1.5">
          {errorMessage}
        </Paragraph>
      ) : null}

      {/* Aranabilir listede arama alanı klavye açtığı için bu bir form sheet: içeriğe göre boy (fit)
          + klavyeyle yukarı kayma. Alt snap noktası (dismissOnSnapToBottom) klavye açılıp kapanırken
          sheet'i kapatabildiği için aşağı kaydırarak kapatma başlıktaki SheetSwipeCloseArea'dan gelir. */}
      <Sheet
        dismissOnOverlayPress
        modal
        moveOnKeyboardChange
        onOpenChange={changeOpen}
        open={open}
        snapPointsMode="fit"
      >
        <AppSheetOverlay />
        <Sheet.Frame
          adjustPaddingForOffscreenContent
          backgroundColor="$background"
          borderBottomLeftRadius={0}
          borderBottomRightRadius={0}
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          maxHeight={maxHeight}
          overflow="visible"
          testID="app-select-sheet-frame"
        >
          <SheetBottomCover testID="app-select-sheet-bottom-cover" />

          <SheetSwipeCloseArea onClose={close} testID="app-select-sheet-swipe-close">
            <YStack
              borderBottomColor="$borderColor"
              borderBottomWidth={1}
              gap="$3"
              padding="$4"
              paddingTop="$2"
            >
              <XStack alignItems="center" gap="$2" justifyContent="space-between">
                <Paragraph color="$color" flex={1} fontSize={16} fontWeight="700" numberOfLines={1}>
                  {title}
                </Paragraph>
                <Button
                  accessibilityLabel={`${title} seçeneklerini kapat`}
                  accessibilityRole="button"
                  chromeless
                  circular
                  hitSlop={8}
                  icon={<X color="$color11" size={22} />}
                  onPress={close}
                  padding={0}
                  size="$3"
                />
              </XStack>
              {searchable ? (
                <SearchField label={`${title} ara`} onChangeText={setQuery} value={query} />
              ) : null}
            </YStack>
          </SheetSwipeCloseArea>

          <KeyboardAwareSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8 }}
            onLayout={listHeight.onLayout}
            style={listHeight.minHeight ? { minHeight: listHeight.minHeight } : undefined}
            testID="app-select-keyboard-aware-scroll"
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
                    close();
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
