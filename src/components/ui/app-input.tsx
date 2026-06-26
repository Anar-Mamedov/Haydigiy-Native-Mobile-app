import { ReactNode } from 'react';
import { GetProps, Input, Label, Paragraph, XStack, YStack, styled } from 'tamagui';

const StyledInput = styled(Input, {
  name: 'AppInput',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderRadius: '$6',
  borderWidth: 1,
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

  return (
    <YStack gap="$2">
      {hideVisibleLabel ? null : <Label htmlFor={fieldId}>{label}</Label>}
      <XStack alignItems="center" position="relative" width="100%">
        <StyledInput
          accessibilityLabel={label}
          flex={1}
          id={fieldId}
          name={name}
          paddingRight={rightElement ? 44 : undefined}
          {...inputProps}
        />
        {rightElement ? (
          <XStack
            alignItems="center"
            bottom={0}
            justifyContent="center"
            position="absolute"
            right={4}
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
