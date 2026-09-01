import { BundleSummary } from '@/types/bundle.types';
import { resolveBundleSavings } from '@/features/bundle/bundle.savings';
import { formatCurrency } from '@/utils/format-currency';
import { DiscountPriceBox } from './discount-price-box';

export type BundleStickyPriceProps = {
  maxFontSizeMultiplier?: number;
  scale?: number;
  summary: BundleSummary;
};

/** Ekran okuyucular paket fiyatını parça parça değil tek bir cümle olarak duysun. */
function buildAccessibilityLabel(
  bundlePriceLabel: string,
  itemsTotalLabel: string,
  rate: number | undefined,
): string {
  if (!itemsTotalLabel) return `Paket fiyatı ${bundlePriceLabel}`;

  const parts = [`Paket fiyatı ${bundlePriceLabel}`, `ayrı alım toplamı ${itemsTotalLabel}`];
  if (rate !== undefined) parts.push(`yüzde ${rate.toLocaleString('tr-TR')} indirim`);

  return parts.join(', ');
}

/**
 * Ürün detayının sabit alt barında gerçek paket toplamını gösterir. Kutunun
 * görsel düzeni indirimli tekil ürünle ortaktır (`DiscountPriceBox`); burada
 * yalnızca paket özeti o düzenin beklediği metinlere çevrilir.
 */
export function BundleStickyPrice({
  maxFontSizeMultiplier,
  scale = 1,
  summary,
}: BundleStickyPriceProps) {
  const { discountRate, hasSavings } = resolveBundleSavings(summary);
  const bundlePriceLabel = formatCurrency(summary.bundlePrice);
  const itemsTotalLabel = hasSavings ? formatCurrency(summary.itemsTotal) : '';

  return (
    <DiscountPriceBox
      accessibilityLabel={buildAccessibilityLabel(bundlePriceLabel, itemsTotalLabel, discountRate)}
      discountRate={discountRate}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      priceLabel={bundlePriceLabel}
      previousPriceLabel={itemsTotalLabel}
      scale={scale}
      testID="product-sticky-footer-bundle-price"
    />
  );
}
