import { ReactNode } from 'react';
import { GetProps, Input, Label, XStack, YStack, styled } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { getTextFieldLabelProps } from '@/components/ui/text-field-label';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';

const RIGHT_ELEMENT_INSET = 4;

const StyledInput = styled(Input, {
  name: 'AppInput',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderRadius: '$6',
  borderWidth: 1,
  // Ekran daha alçak bir `height` verse de alan 48dp'nin altına inmez (Play "Dokunma hedefi boyutu").
  minHeight: MIN_TOUCH_TARGET,
  focusStyle: {
    borderColor: '$color8',
  },
});

export type AppInputProps = GetProps<typeof StyledInput> & {
  errorMessage?: string;
  helperText?: string;
  label: string;
  /** Keeps the input accessible by label while letting composite layouts render their own visible label. */
  hideVisibleLabel?: boolean;
  /** Element pinned to the right edge, vertically centered inside the field (e.g. a password eye). */
  rightElement?: ReactNode;
};

export function AppInput({
  errorMessage,
  helperText,
  hideVisibleLabel,
  id,
  label,
  name,
  rightElement,
  ...inputProps
}: AppInputProps) {
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-');
  const labelId = hideVisibleLabel ? undefined : `${fieldId}-label`;
  const placeholder = typeof inputProps.placeholder === 'string' ? inputProps.placeholder : undefined;

  return (
    <YStack gap="$2">
      {labelId ? (
        // Etikete basmak alana odaklandığı için etiket de bir dokunma hedefi; satırı 48dp tutulur.
        <Label htmlFor={fieldId} id={labelId} lineHeight={MIN_TOUCH_TARGET}>
          {label}
        </Label>
      ) : null}
      <XStack alignItems="center" position="relative" width="100%">
        <StyledInput
          {...getTextFieldLabelProps({ label, labelId, placeholder })}
          flex={1}
          id={fieldId}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          name={name}
          paddingRight={rightElement ? MIN_TOUCH_TARGET + RIGHT_ELEMENT_INSET : undefined}
          {...inputProps}
        />
        {rightElement ? (
          <XStack
            alignItems="center"
            bottom={0}
            justifyContent="center"
            position="absolute"
            right={RIGHT_ELEMENT_INSET}
            top={0}
          >
            {rightElement}
          </XStack>
        ) : null}
      </XStack>
      {errorMessage ? (
        <Paragraph color="$red10" size="$2">
          {errorMessage}
        </Paragraph>
      ) : helperText ? (
        <Paragraph color="$color10" size="$2">
          {helperText}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
