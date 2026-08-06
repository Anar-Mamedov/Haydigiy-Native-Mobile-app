import { ReactNode } from 'react';
import { CircleAlert } from '@/components/ui/icons';
import { ButtonProps, H3, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';

type EmptyStateProps = {
  actionLabel?: string;
  description: string;
  onActionPress?: ButtonProps['onPress'];
  title: string;
  primary?: boolean;
  /** Leading illustration; defaults to a neutral alert glyph. */
  icon?: ReactNode;
};

export function EmptyState({
  actionLabel,
  description,
  onActionPress,
  title,
  primary,
  icon,
}: EmptyStateProps) {
  return (
    <YStack
      alignItems="center"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$7"
      borderWidth={1}
      gap="$3"
      padding="$5"
    >
      {icon ?? <CircleAlert color="$color9" size={32} />}
      <H3 textAlign="center">{title}</H3>
      <Paragraph color="$color10" textAlign="center">
        {description}
      </Paragraph>
      {actionLabel && onActionPress ? (
        <AppButton
          onPress={onActionPress}
          {...(primary
            ? {
                backgroundColor: '$brand',
                borderColor: '$brand',
                color: 'white',
                pressStyle: {
                  backgroundColor: '$brand',
                  opacity: 0.8,
                },
              }
            : {})}
        >
          {actionLabel}
        </AppButton>
      ) : null}
    </YStack>
  );
}
