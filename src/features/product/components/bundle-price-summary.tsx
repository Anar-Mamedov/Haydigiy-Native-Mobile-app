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
 * "Ayrı ayrı alsan X, pakette Y" fiyat satırı.
 * Paket fiyatı ürünlerin toplamından ucuz değilse kazanç rozeti gösterilmez —
 * kullanıcıya olmayan bir indirim vaat edilmez.
 */
export function BundlePriceSummary({ summary }: BundlePriceSummaryProps) {
  const { discountRate, hasSavings } = resolveBundleSavings(summary);

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
        <Paragraph color="$color" fontSize={16} fontWeight="600">
          Paket Fiyatı
        </Paragraph>
        <XStack alignItems="baseline" gap="$2" flexWrap="wrap">
          <Paragraph color="$discount" fontSize={22} fontWeight="800">
            {formatCurrency(summary.bundlePrice)}
          </Paragraph>
          {hasSavings ? (
            <Paragraph color="$color10" fontSize={12} textDecorationLine="line-through">
              {formatCurrency(summary.itemsTotal)}
            </Paragraph>
          ) : null}
        </XStack>
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
            Pakette kazanç:
          </Paragraph>
          <Paragraph color="white" fontSize={13} fontWeight="800">
            {formatCurrency(summary.savings)}
          </Paragraph>
        </XStack>
      ) : null}
    </XStack>
  );
}
