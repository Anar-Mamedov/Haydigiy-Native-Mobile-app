import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { DiscountRateBadge } from '@/components/ui/discount-rate-badge';
import { resolveBundleSavings } from '@/features/bundle/bundle.savings';
import { BundleSummary } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';

export type BundlePriceSummaryProps = {
  summary: BundleSummary;
};

/**
 * "Ayrı ayrı alsan X, pakette Y" fiyat satırı. Ayrı alım toplamı, kalem satırlarındaki tekli
 * fiyatla aynı dilde (`$singlePrice` kırmızısı, üstü çizili) paket fiyatının üstünde durur.
 * Paket fiyatı ürünlerin toplamından ucuz değilse ne bu satır ne de kazanç rozeti gösterilir —
 * kullanıcıya olmayan bir indirim vaat edilmez.
 */
export function BundlePriceSummary({ summary }: BundlePriceSummaryProps) {
  const { discountRate, hasSavings } = resolveBundleSavings(summary);
  const itemsTotalLabel = formatCurrency(summary.itemsTotal);

  return (
    <XStack
      alignItems="flex-end"
      backgroundColor="$discountBackground"
      borderColor="$discount"
      borderRadius="$4"
      borderWidth={1}
      gap="$1"
      justifyContent="space-between"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      position="relative"
    >
      <DiscountRateBadge
        position="absolute"
        rate={discountRate}
        right={-10}
        testID="bundle-summary-discount-badge"
        top={-10}
        zIndex={1}
      />

      <YStack flex={1} gap={2} minWidth={0}>
        {hasSavings ? (
          <XStack
            // Ekran okuyucu üstü çizili tutarı ayırt edemez; satır tek cümle olarak okunur.
            accessibilityLabel={`Ayrı ayrı alırsan ${itemsTotalLabel}`}
            accessible
            alignItems="baseline"
            flexWrap="wrap"
            gap="$1.5"
            marginBottom="$1.5"
          >
            <Paragraph color="$color10" fontSize={12} fontWeight="500" lineHeight={16}>
              Ayrı ayrı alırsan
            </Paragraph>
            <Paragraph color="$singlePrice" fontSize={12} fontWeight="600" lineHeight={16} textDecorationLine="line-through">
              {itemsTotalLabel}
            </Paragraph>
          </XStack>
        ) : null}
        <Paragraph color="$color" fontSize={16} fontWeight="600">
          Paket Fiyatı
        </Paragraph>
        <Paragraph color="$discount" fontSize={22} fontWeight="800">
          {formatCurrency(summary.bundlePrice)}
        </Paragraph>
      </YStack>

      {hasSavings ? (
        <XStack
          alignItems="center"
          backgroundColor="$savingsBadge"
          borderRadius="$3"
          flexShrink={0}
          gap="$1"
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
        >
          <Paragraph color="white" fontSize={11} fontWeight="600">
            Kazancın:
          </Paragraph>
          <Paragraph color="white" fontSize={13} fontWeight="800">
            {formatCurrency(summary.savings)}
          </Paragraph>
        </XStack>
      ) : null}
    </XStack>
  );
}
