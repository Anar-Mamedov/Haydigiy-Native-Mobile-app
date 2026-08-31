import { Button, Sheet, XStack, YStack } from 'tamagui';
import { AppInput } from '@/components/ui/app-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { Calculator, X } from '@/components/ui/icons';
import { useSizeCalculator, type SizeCalculatorGender } from '../hooks/use-size-calculator';

const GENDER_OPTIONS: { label: string; value: SizeCalculatorGender }[] = [
  { label: 'Kadın', value: 'female' },
  { label: 'Erkek', value: 'male' },
  { label: 'Çocuk', value: 'child' },
];

type SizeCalculatorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculateComplete?: (size: string) => void;
};

/**
 * "Bedenimi Hesapla" bottom sheet. The sheet fits its content and moves with the
 * keyboard, and the form scrolls through the shared keyboard-aware wrapper so the
 * focused boy/kilo inputs stay visible above the native keyboard.
 */
export function SizeCalculatorModal({ open, onOpenChange, onCalculateComplete }: SizeCalculatorModalProps) {
  const {
    calculate,
    error,
    gender,
    height,
    isCalculating,
    result,
    setGender,
    setHeight,
    setWeight,
    weight,
  } = useSizeCalculator({ onCalculated: onCalculateComplete });

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      moveOnKeyboardChange
      onOpenChange={onOpenChange}
      open={open}
      snapPointsMode="fit"
      unmountChildrenWhenHidden
    >
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        maxHeight="92%"
        overflow="visible"
        testID="size-calculator-sheet-frame"
      >
        <SheetBottomCover testID="size-calculator-sheet-bottom-cover" />

        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingHorizontal={16}
          paddingVertical={12}
        >
          <XStack alignItems="center" gap="$2">
            <Calculator color="$brand" size={18} />
            <Paragraph fontSize={16} fontWeight="700">
              Bedenimi Hesapla
            </Paragraph>
          </XStack>
          <Button
            accessibilityLabel="Kapat"
            accessibilityRole="button"
            backgroundColor="transparent"
            chromeless
            circular
            icon={<X size={18} />}
            onPress={() => onOpenChange(false)}
            size="$3"
          />
        </XStack>

        <KeyboardAwareSheetScrollView
          contentContainerStyle={{ gap: 16, padding: 20 }}
          testID="size-calculator-keyboard-aware-scroll"
        >
          <XStack gap="$3">
            <YStack flex={1} gap="$1.5">
              <Paragraph color="$color10" fontSize={12} fontWeight="600">
                Boy (cm)
              </Paragraph>
              <AppInput
                borderRadius={8}
                height={44}
                hideVisibleLabel
                keyboardType="numeric"
                label="Boy (cm)"
                onChangeText={setHeight}
                paddingHorizontal={12}
                placeholder="Örn: 172"
                returnKeyType="done"
                value={height}
              />
            </YStack>
            <YStack flex={1} gap="$1.5">
              <Paragraph color="$color10" fontSize={12} fontWeight="600">
                Kilo (kg)
              </Paragraph>
              <AppInput
                borderRadius={8}
                height={44}
                hideVisibleLabel
                keyboardType="numeric"
                label="Kilo (kg)"
                onChangeText={setWeight}
                paddingHorizontal={12}
                placeholder="Örn: 59"
                returnKeyType="done"
                value={weight}
              />
            </YStack>
          </XStack>

          <YStack gap="$1.5">
            <Paragraph color="$color10" fontSize={12} fontWeight="600">
              Cinsiyet
            </Paragraph>
            <XStack gap="$2">
              {GENDER_OPTIONS.map((option) => {
                const isActive = gender === option.value;
                return (
                  <Button
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    backgroundColor={isActive ? '$brand' : '$color3'}
                    borderRadius={8}
                    flex={1}
                    key={option.value}
                    onPress={() => setGender(option.value)}
                  >
                    <Paragraph color={isActive ? 'white' : '$color11'} fontSize={12} fontWeight="700">
                      {option.label}
                    </Paragraph>
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          <Button
            accessibilityRole="button"
            accessibilityState={{ busy: isCalculating, disabled: isCalculating }}
            backgroundColor="$brand"
            borderRadius={8}
            disabled={isCalculating}
            height={46}
            marginTop="$2"
            onPress={calculate}
          >
            <Paragraph color="white" fontWeight="800">
              {isCalculating ? 'Hesaplanıyor...' : 'Hesapla'}
            </Paragraph>
          </Button>

          {error ? (
            <Paragraph color="$red10" fontSize={13} textAlign="center">
              {error}
            </Paragraph>
          ) : null}

          {result ? (
            <YStack
              accessibilityLabel={`Sizin için önerilen beden: ${result}`}
              accessibilityLiveRegion="polite"
              accessibilityRole="text"
              accessible
              backgroundColor="$orange3"
              borderRadius={12}
              gap="$2.5"
              marginTop="$3"
              padding="$4"
            >
              <Paragraph color="$color" fontSize={14} fontWeight="600" textAlign="center">
                Sizin İçin Önerilen Beden:
              </Paragraph>
              <YStack
                alignItems="center"
                alignSelf="stretch"
                backgroundColor="$background"
                borderColor="$brand"
                borderRadius={14}
                borderWidth={1}
                justifyContent="center"
                minHeight={56}
                paddingHorizontal="$4"
                paddingVertical="$3"
              >
                <Paragraph
                  adjustsFontSizeToFit
                  color="$brand"
                  fontSize={24}
                  fontWeight="900"
                  numberOfLines={1}
                  textAlign="center"
                >
                  {result}
                </Paragraph>
              </YStack>
            </YStack>
          ) : null}
        </KeyboardAwareSheetScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
