import { Check, Truck } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CampaignCountdown } from '@/features/cart/components/campaign-countdown';
import { CartCampaign } from '@/types/cart.types';
import { formatCeilAmount } from '@/utils/format-currency';
import { getFreeShippingCampaign } from '@/utils/cart-campaigns';

type FreeShippingCampaignCardProps = {
  campaigns: CartCampaign[] | undefined;
  subtotal: number;
};

function formatPrice(amount: number) {
  return `${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

/**
 * Free-shipping progress card. Shows remaining amount + progress bar, or a
 * "Kargo ücretsiz" success state, plus an optional countdown — a 1:1 port of the
 * web `FreeShippingCampaignCard`.
 */
export function FreeShippingCampaignCard({
  campaigns,
  subtotal,
}: FreeShippingCampaignCardProps) {
  const campaign = getFreeShippingCampaign(campaigns, subtotal);
  if (!campaign) return null;
  if (!campaign.isApplicable && campaign.threshold <= 0) return null;

  const { isApplicable, progress } = campaign;

  return (
    <YStack
      backgroundColor="$background"
      borderColor={isApplicable ? '$brand' : '$borderColor'}
      borderRadius="$5"
      borderWidth={1}
      padding="$3"
    >
      <XStack alignItems="center" gap="$3">
        <XStack
          alignItems="center"
          backgroundColor={isApplicable ? '$brand' : '$backgroundHover'}
          borderRadius={100}
          height={40}
          justifyContent="center"
          width={40}
        >
          {isApplicable ? (
            <Check color="white" size={20} />
          ) : (
            <Truck color="$brand" size={20} />
          )}
        </XStack>

        <YStack flex={1} gap="$1">
          {campaign.name ? (
            <Paragraph color="$color10" fontSize={12} fontWeight="500">
              {campaign.name}
            </Paragraph>
          ) : null}

          {isApplicable ? (
            <Paragraph color="$brand" fontSize={14} fontWeight="700">
              Tebrikler! Kargo ücretsiz.
            </Paragraph>
          ) : (
            <Paragraph color="$color" fontSize={14} fontWeight="700">
              <Paragraph color="$brand" fontSize={14} fontWeight="700">
                {formatCeilAmount(campaign.remaining)}
              </Paragraph>
              {`'lik daha ürün eklersen `}
              <Paragraph color="$brand" fontSize={14} fontWeight="700">
                Ücretsiz Kargo
              </Paragraph>
            </Paragraph>
          )}

          <Paragraph color="$color10" fontSize={12}>
            {formatPrice(campaign.threshold)} ve üzeri siparişlerde ücretsiz kargo
          </Paragraph>

          <YStack
            backgroundColor="$backgroundHover"
            borderRadius={100}
            height={6}
            marginTop="$2"
            overflow="hidden"
            width="100%"
          >
            <YStack backgroundColor="$brand" borderRadius={100} height="100%" width={`${progress}%`} />
          </YStack>

          <CampaignCountdown endDate={campaign.endDate} />
        </YStack>
      </XStack>
    </YStack>
  );
}
