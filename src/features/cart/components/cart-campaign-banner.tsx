import { useRouter } from 'expo-router';
import { XStack, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Info } from '@/components/ui/icons';
import { useCartCampaignBannerQuery } from '@/features/cart/api/cart.queries';
import { CartCampaignBannerStatus } from '@/types/cart.types';
import { formatAmount } from '@/utils/format-currency';

type CartCampaignBannerViewProps = {
  status: CartCampaignBannerStatus;
  onGoToCart: () => void;
};

/** "0/2.000 TL"; eşiksiz kampanyalarda yalnızca mevcut tutar gösterilir. */
function buildAmountLabel(status: CartCampaignBannerStatus): string {
  const current = formatAmount(status.currentAmount);
  return status.threshold ? `${current}/${formatAmount(status.threshold)} TL` : `${current} TL`;
}

/**
 * Kampanya bandının sunum katmanı. Veri çekme ve yönlendirme içermez; hazır
 * modeli alıp çizer, böylece sağlayıcıya gerek kalmadan test edilebilir.
 *
 * Kendi yatay boşluğunu koymaz; içine yerleştirildiği kabın genişliğini doldurur.
 * Bant için `accessible` verilmez, aksi halde çocuklar tek bir düğümde birleşip
 * "Sepete git" düğmesi ekran okuyucuyla ayrıca odaklanamaz hale gelir.
 */
export function CartCampaignBannerView({ status, onGoToCart }: CartCampaignBannerViewProps) {
  return (
    <YStack
      backgroundColor="$brand"
      borderRadius="$5"
      gap="$2"
      marginBottom="$2"
      paddingHorizontal="$3"
      paddingVertical="$3"
      testID="cart-campaign-banner"
    >
      <XStack alignItems="center" gap="$2" justifyContent="center">
        <Info color="white" size={16} />
        <Paragraph
          color="white"
          flexShrink={1}
          fontSize={14}
          fontWeight="700"
          numberOfLines={2}
          textAlign="center"
        >
          {status.campaignName}
        </Paragraph>
      </XStack>

      <XStack
        alignItems="center"
        backgroundColor="$background"
        borderRadius="$5"
        gap="$3"
        paddingHorizontal="$3"
        paddingVertical="$3"
      >
        <YStack flex={1} gap="$1" minWidth={0}>
          <Paragraph color="$color" fontSize={15} fontWeight="700">
            {'Toplam: '}
            <Paragraph color="$brand" fontSize={15} fontWeight="700">
              {buildAmountLabel(status)}
            </Paragraph>
          </Paragraph>
          <Paragraph color="$color10" fontSize={12} lineHeight={16}>
            {status.message}
          </Paragraph>
        </YStack>

        <AppButton
          accessibilityLabel="Sepete git"
          accessibilityRole="button"
          backgroundColor="$brand"
          borderColor="$brand"
          color="white"
          minWidth={104}
          onPress={onGoToCart}
          pressStyle={{ backgroundColor: '$brand', borderColor: '$brand', opacity: 0.85 }}
          testID="cart-campaign-banner-cta"
        >
          Sepete git
        </AppButton>
      </XStack>
    </YStack>
  );
}

/**
 * Ürün listesi ekranında gösterilen sepet kampanya bandı — web'deki
 * `CartCampaignBanner`'ın karşılığı. Ekran kampanya verisini hiç görmez;
 * yalnızca bu bileşeni yerleştirir.
 *
 * Gösterilecek kampanya yoksa (boş sepet, kampanyasız hesap ya da başarısız
 * istek) hiçbir şey render edilmez ve liste düzeni olduğu gibi kalır.
 */
export function CartCampaignBanner() {
  const router = useRouter();
  const { data: status } = useCartCampaignBannerQuery();

  if (!status) return null;

  return <CartCampaignBannerView onGoToCart={() => router.push('/cart')} status={status} />;
}
