import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
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
  const hasSavings = summary.savings > 0;

  return (
    <XStack
      alignItems="flex-end"
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      justifyContent="space-between"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
    >
      <YStack flex={1} gap={2}>
        <Paragraph color="$color10" fontSize={11} fontWeight="600">
          Paket Fiyatı
        </Paragraph>
        <XStack alignItems="baseline" gap="$2" flexWrap="wrap">
          <Paragraph color="$brand" fontSize={22} fontWeight="800">
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
        <YStack
          alignItems="flex-end"
          backgroundColor="$green10"
          borderRadius="$3"
          paddingHorizontal="$2.5"
          paddingVertical="$1.5"
        >
          <Paragraph color="white" fontSize={10} fontWeight="600">
            Pakette kazanç
          </Paragraph>
          <Paragraph color="white" fontSize={13} fontWeight="800">
            {formatCurrency(summary.savings)}
            {summary.savingsPercent > 0 ? ` (%${summary.savingsPercent})` : ''}
          </Paragraph>
        </YStack>
      ) : null}
    </XStack>
  );
}
