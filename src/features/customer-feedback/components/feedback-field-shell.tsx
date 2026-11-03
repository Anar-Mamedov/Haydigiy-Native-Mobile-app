import { ReactNode } from 'react';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type FeedbackFieldShellProps = {
  label: string;
  error?: string;
  children: ReactNode;
  testID?: string;
};

/** AppInput dışındaki alanların (seçim, onay, puan, dosya) görünür etiketi ve alan altı hatası. */
export function FeedbackFieldShell({ label, error, children, testID }: FeedbackFieldShellProps) {
  return (
    <YStack gap="$2" testID={testID}>
      <Paragraph color="$color" fontSize={14} fontWeight="600">
        {label}
      </Paragraph>
      {children}
      {error ? (
        <Paragraph accessibilityLiveRegion="polite" color="$red10" fontSize={12}>
          {error}
        </Paragraph>
      ) : null}
    </YStack>
  );
}

export const requiredLabel = (label: string, required: boolean) => (required ? `${label} *` : label);
