import { useEffect, useState } from 'react';
import { Check, Clock, Truck } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { CartCampaign } from '@/types/cart.types';
import { getFreeShippingCampaign } from '@/utils/cart-campaigns';

type FreeShippingCampaignCardProps = {
  campaigns: CartCampaign[] | undefined;
  subtotal: number;
};

function formatShort(amount: number) {
  return `${Math.ceil(amount).toLocaleString('tr-TR')} TL`;
}

function formatPrice(amount: number) {
  return `${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getTimeLeft(endDateStr: string) {
  const diff = Math.max(0, new Date(endDateStr).getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSecs / 86400),
    hours: Math.floor((totalSecs % 86400) / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
    expired: diff === 0,
  };
}

function CountdownChip({ label }: { label: string }) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$brand"
      borderRadius="$2"
      justifyContent="center"
      opacity={0.92}
      paddingHorizontal="$1.5"
      paddingVertical="$0.5"
    >
      <Paragraph color="white" fontSize={11} fontWeight="800">
        {label}
      </Paragraph>
    </XStack>
  );
}

function CountdownTimer({ endDateStr }: { endDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDateStr));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTimeLeft(endDateStr);
      setTimeLeft(next);
      if (next.expired) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endDateStr]);

  if (timeLeft.expired) return null;

  return (
    <XStack alignItems="center" gap="$1.5" marginTop="$2">
      <Clock color="$brand" size={14} />
      <Paragraph color="$color10" fontSize={12}>
        Kampanya bitiş:
      </Paragraph>
      <XStack alignItems="center" gap="$1">
        {timeLeft.days > 0 ? <CountdownChip label={`${timeLeft.days}g`} /> : null}
        <CountdownChip label={`${pad(timeLeft.hours)}s`} />
        <CountdownChip label={`${pad(timeLeft.minutes)}d`} />
        <CountdownChip label={`${pad(timeLeft.seconds)}sn`} />
      </XStack>
    </XStack>
  );
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
                {formatShort(campaign.remaining)}
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

          {campaign.endDate ? <CountdownTimer endDateStr={campaign.endDate} /> : null}
        </YStack>
      </XStack>
    </YStack>
  );
}
