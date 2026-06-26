import { YStack } from 'tamagui';
import { SCRIM_COLOR } from '@/lib/theme/colors';

interface CheckoutSummaryBackdropProps {
  visible: boolean;
  onPress: () => void;
}

/**
 * Tap-to-dismiss scrim shown behind the expanded order summary. Built from a
 * Tamagui primitive (not a StyleSheet) and uses the centralized {@link SCRIM_COLOR}
 * — a fixed slight-black dim — rather than a hard-coded literal per overlay.
 */
export function CheckoutSummaryBackdrop({ visible, onPress }: CheckoutSummaryBackdropProps) {
  if (!visible) return null;

  return (
    <YStack
      accessibilityLabel="Sipariş özetini kapat"
      accessibilityRole="button"
      backgroundColor={SCRIM_COLOR}
      bottom={0}
      left={0}
      onPress={onPress}
      position="absolute"
      right={0}
      testID="checkout-summary-backdrop"
      top={0}
      zIndex={1}
    />
  );
}
