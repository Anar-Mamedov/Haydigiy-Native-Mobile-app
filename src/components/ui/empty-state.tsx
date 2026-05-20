import { CircleAlert } from '@tamagui/lucide-icons-2';
import { ButtonProps, H3, Paragraph, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';

type EmptyStateProps = {
  actionLabel?: string;
  description: string;
  onActionPress?: ButtonProps['onPress'];
  title: string;
};

export function EmptyState({
  actionLabel,
  description,
  onActionPress,
  title,
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
      <CircleAlert color="$color9" size={32} />
      <H3 textAlign="center">{title}</H3>
      <Paragraph color="$color10" textAlign="center">
        {description}
      </Paragraph>
      {actionLabel && onActionPress ? (
        <AppButton onPress={onActionPress}>{actionLabel}</AppButton>
      ) : null}
    </YStack>
  );
}
