import { useState } from 'react';
import { Separator, XStack, YStack } from 'tamagui';
import { Check, ChevronDown, Tag } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { CampaignCountdown } from '@/features/cart/components/campaign-countdown';
import { CartCampaign } from '@/types/cart.types';
import { formatCeilAmount, formatCurrency } from '@/utils/format-currency';
import {
  getFreeShippingCampaign,
  getStandardCampaigns,
  type StandardCampaignStatus,
} from '@/utils/cart-campaigns';

type StandardCampaignCardProps = {
  campaigns: CartCampaign[] | undefined;
  subtotal: number;
};

const FREE_SHIPPING_FALLBACK_NAME = 'Kargo Bedava Kampanyası';

/** Kampanya tipini tek yerde tanımlar; satırların metinleri buna göre değişir. */
function isFreeShipping(campaign: StandardCampaignStatus) {
  return campaign.type === 'free_shipping';
}

/**
 * Gösterilecek kampanyalar: eşiğe ulaşmamış olanlar da dahil tüm standart
 * kampanyalar, ardından (varsa) ücretsiz kargo kampanyası. Web
 * `StandartCampaignCard` ile aynı sıralama.
 */
function collectCampaigns(
  campaigns: CartCampaign[] | undefined,
  subtotal: number,
): StandardCampaignStatus[] {
  const standard = getStandardCampaigns(campaigns, subtotal);
  const freeShipping = getFreeShippingCampaign(campaigns, subtotal);
  const hasVisibleFreeShipping =
    freeShipping !== null && (freeShipping.isApplicable || freeShipping.threshold > 0);

  if (!hasVisibleFreeShipping) return standard;

  return [
    ...standard,
    { ...freeShipping, name: freeShipping.name || FREE_SHIPPING_FALLBACK_NAME },
  ];
}

function CampaignProgressBar({ progress }: { progress: number }) {
  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderRadius={100}
      height={6}
      marginTop="$1.5"
      overflow="hidden"
      width="100%"
    >
      <YStack backgroundColor="$brand" borderRadius={100} height="100%" width={`${progress}%`} />
    </YStack>
  );
}

/** Eşiği tamamlanmış kampanya: onay işareti, indirim tutarı ve bilgi metni. */
function CompletedCampaignRow({ campaign }: { campaign: StandardCampaignStatus }) {
  const discount = Number(campaign.discount ?? 0);
  const hasDiscount = Number.isFinite(discount) && discount > 0;
  const freeShipping = isFreeShipping(campaign);
  const message =
    campaign.message ||
    (freeShipping ? 'Tebrikler, kargonuz ücretsiz!' : `${campaign.name} sepette uygulandı.`);

  return (
    <XStack alignItems="flex-start" gap="$2.5">
      <XStack
        alignItems="center"
        backgroundColor="$brand"
        borderRadius={100}
        height={24}
        justifyContent="center"
        marginTop={2}
        width={24}
      >
        <Check color="white" size={14} />
      </XStack>

      <YStack flex={1} gap="$1">
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          <Paragraph color="$color" flex={1} fontSize={14} fontWeight="700" numberOfLines={1}>
            {campaign.name}
          </Paragraph>
          {hasDiscount ? (
            <Paragraph color="$brand" fontSize={14} fontWeight="800">
              {`-${formatCurrency(discount)}`}
            </Paragraph>
          ) : null}
        </XStack>

        <Paragraph color="$brand" fontSize={12}>
          {message}
        </Paragraph>

        {/* Ücretsiz kargoda dolu çubuk, kampanyanın tamamlandığını görünür kılar. */}
        {freeShipping ? <CampaignProgressBar progress={100} /> : null}
        {campaign.counter === 1 ? <CampaignCountdown endDate={campaign.endDate} /> : null}
      </YStack>
    </XStack>
  );
}

/** Eşiğe ulaşmamış kampanya: kalan tutar, yönlendirme metni ve ilerleme çubuğu. */
function PendingCampaignRow({ campaign }: { campaign: StandardCampaignStatus }) {
  const freeShipping = isFreeShipping(campaign);
  const remaining = formatCeilAmount(campaign.remaining);

  return (
    <YStack gap="$1.5">
      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <Paragraph color="$color" flex={1} fontSize={14} fontWeight="700" numberOfLines={1}>
          {campaign.name}
        </Paragraph>
        <Paragraph color="$brand" fontSize={12} fontWeight="800">
          {freeShipping ? `${remaining} kaldı` : `${remaining} eksik`}
        </Paragraph>
      </XStack>

      <Paragraph color="$color10" fontSize={12}>
        <Paragraph color="$brand" fontSize={12} fontWeight="700">
          {remaining}
        </Paragraph>
        {freeShipping ? "'lik daha ürün eklersen kargo ücretsiz" : "'lik daha ürün ekleyin"}
      </Paragraph>

      <CampaignProgressBar progress={campaign.progress} />
      {campaign.counter === 1 ? <CampaignCountdown endDate={campaign.endDate} /> : null}
    </YStack>
  );
}

/**
 * Ödeme ekranındaki kampanya listesi: standart sepet kampanyaları ve ücretsiz
 * kargo kampanyası tek bir akordeon kartta toplanır. Web `StandartCampaignCard`
 * paritesi — tek kampanya varsa kart açık başlar, birden fazlasında kapalı.
 *
 * Gösterilecek kampanya yoksa hiç render edilmez.
 */
export function StandardCampaignCard({ campaigns, subtotal }: StandardCampaignCardProps) {
  const visibleCampaigns = collectCampaigns(campaigns, subtotal);
  const campaignCount = visibleCampaigns.length;
  // Kullanıcının seçimi, yapıldığı kampanya sayısıyla birlikte tutulur. Sayı
  // değişince (sepet güncellendi, eşik aşıldı) kart varsayılanına döner: tek
  // kampanya doğrudan görünür, kalabalık listede özet satırı yeter.
  const [toggled, setToggled] = useState<{ campaignCount: number; expanded: boolean } | null>(null);
  const expanded =
    toggled && toggled.campaignCount === campaignCount ? toggled.expanded : campaignCount === 1;

  if (campaignCount === 0) return null;

  return (
    <SectionCard padding={0} overflow="hidden">
      <XStack
        accessibilityLabel={`Kampanyalar, ${campaignCount} kampanya`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        alignItems="center"
        gap="$2"
        justifyContent="space-between"
        onPress={() => setToggled({ campaignCount, expanded: !expanded })}
        padding="$3.5"
        pressStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <XStack alignItems="center" flex={1} gap="$2.5">
          <XStack
            alignItems="center"
            backgroundColor="$backgroundHover"
            borderRadius="$3"
            height={32}
            justifyContent="center"
            width={32}
          >
            <Tag color="$brand" size={16} />
          </XStack>
          <Paragraph color="$color" flex={1} fontSize={15} fontWeight="700">
            Kampanyalar
          </Paragraph>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <XStack
            alignItems="center"
            backgroundColor="$backgroundHover"
            borderRadius={100}
            paddingHorizontal="$2.5"
            paddingVertical="$1"
          >
            <Paragraph color="$brand" fontSize={12} fontWeight="700">
              {`${campaignCount} Kampanya`}
            </Paragraph>
          </XStack>
          <YStack rotate={expanded ? '180deg' : '0deg'}>
            <ChevronDown color="$color10" size={20} />
          </YStack>
        </XStack>
      </XStack>

      {expanded ? (
        <>
          <Separator borderColor="$borderColor" />
          <YStack gap="$3" padding="$3.5">
            {visibleCampaigns.map((campaign, index) => (
              <YStack gap="$3" key={campaign.id ?? index}>
                {index > 0 ? <Separator borderColor="$borderColor" /> : null}
                {campaign.isApplicable ? (
                  <CompletedCampaignRow campaign={campaign} />
                ) : (
                  <PendingCampaignRow campaign={campaign} />
                )}
              </YStack>
            ))}
          </YStack>
        </>
      ) : null}
    </SectionCard>
  );
}
