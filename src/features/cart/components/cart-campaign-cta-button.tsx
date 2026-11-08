import { AppButton } from '@/components/ui/app-button';

/**
 * Kampanya bandındaki "Sepete git" düğmesi. Normal ve hediye kampanya sayfaları
 * aynı düğmeyi kullanır. Boyu bilinçli olarak küçültülmez; 44pt dokunma hedefi
 * korunur.
 */
export function CartCampaignCtaButton({ onPress }: { onPress: () => void }) {
  return (
    <AppButton
      accessibilityLabel="Sepete git"
      accessibilityRole="button"
      backgroundColor="$brand"
      borderColor="$brand"
      color="white"
      minWidth={92}
      onPress={onPress}
      pressStyle={{ backgroundColor: '$brand', borderColor: '$brand', opacity: 0.85 }}
      testID="cart-campaign-banner-cta"
    >
      Sepete git
    </AppButton>
  );
}
