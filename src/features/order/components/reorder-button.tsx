import { Spinner } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Paragraph } from '@/components/ui/app-paragraph';
import { RotateCcw } from '@/components/ui/icons';

const LABEL = 'Siparişi Tekrarla';

type ReorderButtonProps = {
  isLoading: boolean;
  onPress: () => void;
};

/**
 * "Siparişi Tekrarla" on the order detail screen. Styled like the screen's other
 * order actions (outlined, 48dp); locked with a spinner while a request runs so a
 * second tap cannot add the order to the cart twice.
 */
export function ReorderButton({ isLoading, onPress }: ReorderButtonProps) {
  const icon = isLoading ? (
    <Spinner color="$brand" size="small" testID="order-reorder-spinner" />
  ) : (
    RotateCcw
  );

  return (
    <AppButton
      accessibilityLabel={LABEL}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isLoading }}
      backgroundColor="$background"
      borderColor="$brand"
      borderRadius="$4"
      borderWidth={1}
      color="$brand"
      disabled={isLoading}
      height={48}
      icon={icon}
      onPress={onPress}
      opacity={isLoading ? 0.7 : 1}
      pressStyle={{ backgroundColor: '$backgroundHover', borderColor: '$brand' }}
      testID="order-reorder-button"
    >
      <Paragraph color="$brand" fontSize={14} fontWeight="700">
        {LABEL}
      </Paragraph>
    </AppButton>
  );
}
