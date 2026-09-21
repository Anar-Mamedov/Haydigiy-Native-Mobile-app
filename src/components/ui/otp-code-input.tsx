import { useRef } from 'react';
import { Pressable, TextInput } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

const DEFAULT_CODE_LENGTH = 6;

export type OtpCodeInputProps = {
  /** Accessible name of the hidden field that actually receives the digits. */
  accessibilityLabel: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Accessible name of the box row, which focuses the field when pressed. */
  focusAccessibilityLabel?: string;
  length?: number;
  onChangeText: (code: string) => void;
  testID?: string;
  value: string;
};

/**
 * Shared one-time-code field: themed digit boxes backed by a single hidden
 * `TextInput`. Every OTP surface (login, phone verification, account deletion)
 * renders this instead of re-implementing the boxes, so entry behavior, digit
 * filtering and the accessibility contract stay identical across the app.
 */
export function OtpCodeInput({
  accessibilityLabel,
  autoFocus = false,
  disabled = false,
  focusAccessibilityLabel,
  length = DEFAULT_CODE_LENGTH,
  onChangeText,
  testID,
  value,
}: OtpCodeInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    onChangeText(text.replace(/\D/g, '').slice(0, length));
  };

  return (
    <YStack width="100%">
      {/* The boxes are a touch target only; the hidden field below carries the
          accessible name, so they stay out of the accessibility tree unless the
          caller explicitly asks for a labelled focus control. */}
      <Pressable
        accessibilityLabel={focusAccessibilityLabel}
        accessibilityRole={focusAccessibilityLabel ? 'button' : undefined}
        accessible={Boolean(focusAccessibilityLabel)}
        disabled={disabled}
        importantForAccessibility={focusAccessibilityLabel ? 'yes' : 'no-hide-descendants'}
        onPress={() => inputRef.current?.focus()}
        style={{ width: '100%' }}
      >
        <XStack gap="$2" justifyContent="space-between" paddingVertical="$2" width="100%">
          {Array.from({ length }, (_, index) => {
            const digit = value[index] || '';
            const isFocused = index === value.length;

            return (
              <YStack
                alignItems="center"
                backgroundColor="$background"
                borderColor={isFocused ? '$brand' : '$borderColor'}
                borderRadius={8}
                borderWidth={1.5}
                height={52}
                justifyContent="center"
                key={index}
                opacity={disabled ? 0.5 : 1}
                width={48}
              >
                <Paragraph color="$color" fontSize={20} fontWeight="700">
                  {digit}
                </Paragraph>
              </YStack>
            );
          })}
        </XStack>
      </Pressable>

      {/* Hidden field: the boxes above are purely presentational. */}
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoFocus={autoFocus}
        editable={!disabled}
        keyboardType="numeric"
        maxLength={length}
        onChangeText={handleChangeText}
        ref={inputRef}
        style={{ height: 1, opacity: 0, position: 'absolute', width: 1 }}
        testID={testID}
        textContentType="oneTimeCode"
        value={value}
      />
    </YStack>
  );
}
