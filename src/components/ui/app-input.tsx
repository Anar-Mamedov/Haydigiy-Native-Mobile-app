import { GetProps, Input, Label, Paragraph, YStack, styled } from 'tamagui';

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
};

export function AppInput({
  errorMessage,
  helperText,
  id,
  label,
  name,
  ...inputProps
}: AppInputProps) {
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <YStack gap="$2">
      <Label htmlFor={fieldId}>{label}</Label>
      <StyledInput accessibilityLabel={label} id={fieldId} name={name} {...inputProps} />
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
