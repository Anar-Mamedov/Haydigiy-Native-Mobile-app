import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TrendingDown } from '@/components/ui/icons';
import { DISCOUNT_RATE_BADGE_COLOR } from '@/lib/theme/colors';
import {
  formatDiscountRate,
  formatProductPrice,
  resolveProductDiscount,
  type ProductDiscountInput,
} from '../utils/product-price';

type ProductPriceProps = ProductDiscountInput & {
  /** Yüksekliği sabit yüzeylerde (sticky footer) yazı büyümesini sınırlar. */
  maxFontSizeMultiplier?: number;
  /** Satır yüksekliklerini kullanıcının yazı ölçeğiyle birlikte büyütür. */
  scale?: number;
  testID?: string;
};

/** Ekran okuyucular fiyatı parça parça değil tek bir cümle olarak duysun. */
function buildAccessibilityLabel(
  priceLabel: string,
  firstPriceLabel: string,
  rate: number | undefined,
): string {
  if (!firstPriceLabel && rate === undefined) return priceLabel;

  const parts = [`İndirimli fiyat ${priceLabel}`];
  if (firstPriceLabel) parts.push(`eski fiyat ${firstPriceLabel}`);
  if (rate !== undefined) parts.push(`yüzde ${rate.toLocaleString('tr-TR')} indirim`);

  return parts.join(', ');
}

/**
 * Liste/ızgara kartındaki fiyat satırı. İndirim varsa kırmızı oran rozeti, yeşil
 * güncel fiyat ve üstü çizili eski fiyat; yoksa yalnız yeşil güncel fiyat gösterilir.
 * Renkler bileşenin içinde sabitlendiği için kartlar temaya göre yama yapmak zorunda
 * kalmaz.
 */
export function ProductCardPrice({
  discountRate,
  firstPrice,
  hasDiscount,
  maxFontSizeMultiplier,
  price,
  testID,
}: ProductPriceProps) {
  const discount = resolveProductDiscount({ discountRate, firstPrice, hasDiscount, price });
  const priceLabel = formatProductPrice(price);
  const firstPriceLabel = discount.firstPrice ? formatProductPrice(discount.firstPrice) : '';

  return (
    <XStack
      accessibilityLabel={buildAccessibilityLabel(priceLabel, firstPriceLabel, discount.discountRate)}
      accessibilityRole="text"
      accessible
      alignItems="center"
      flexWrap="wrap"
      gap={6}
      testID={testID}
      width="100%"
    >
      {discount.discountRate !== undefined ? (
        <XStack
          backgroundColor={DISCOUNT_RATE_BADGE_COLOR}
          borderRadius={4}
          flexShrink={0}
          paddingHorizontal={4}
          paddingVertical={2}
        >
          <Paragraph
            color="white"
            fontSize={10}
            fontWeight="700"
            lineHeight={13}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
          >
            {formatDiscountRate(discount.discountRate)}
          </Paragraph>
        </XStack>
      ) : null}

      <Paragraph
        color="$discount"
        fontSize={14}
        fontWeight="700"
        lineHeight={18}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        {priceLabel}
      </Paragraph>

      {firstPriceLabel ? (
        <Paragraph
          color="$color10"
          fontSize={11}
          lineHeight={15}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          textDecorationLine="line-through"
        >
          {firstPriceLabel}
        </Paragraph>
      ) : null}
    </XStack>
  );
}

/**
 * Ürün detayındaki indirimli fiyat kutusu: yeşil çerçeve, sağ üstte oran rozeti,
 * içeride üstü çizili eski fiyat ve yeşil güncel fiyat. İndirim yoksa `null` döner;
 * çağıran yüzey kendi normal fiyat düzenini korur.
 */
export function ProductDetailDiscountPrice({
  discountRate,
  firstPrice,
  hasDiscount,
  maxFontSizeMultiplier,
  price,
  scale = 1,
  testID,
}: ProductPriceProps) {
  const discount = resolveProductDiscount({ discountRate, firstPrice, hasDiscount, price });
  if (!discount.isDiscounted) return null;

  const priceLabel = formatProductPrice(price);
  const firstPriceLabel = discount.firstPrice ? formatProductPrice(discount.firstPrice) : '';

  return (
    <YStack
      accessibilityLabel={buildAccessibilityLabel(priceLabel, firstPriceLabel, discount.discountRate)}
      accessibilityRole="text"
      accessible
      borderColor="$discount"
      borderRadius={8}
      borderWidth={1}
      paddingHorizontal={10}
      paddingVertical={6}
      position="relative"
      testID={testID}
    >
      <XStack alignItems="baseline" gap={6}>
        {firstPriceLabel ? (
          <Paragraph
            color="$color10"
            fontSize={13}
            fontWeight="600"
            lineHeight={Math.round(17 * scale)}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            textDecorationLine="line-through"
          >
            {firstPriceLabel}
          </Paragraph>
        ) : null}
        <Paragraph
          color="$discount"
          fontSize={20}
          fontWeight="900"
          letterSpacing={-0.5}
          lineHeight={Math.round(24 * scale)}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
        >
          {priceLabel}
        </Paragraph>
      </XStack>

      {discount.discountRate !== undefined ? (
        <XStack
          alignItems="center"
          backgroundColor="$discountBadge"
          borderRadius={999}
          gap={2}
          paddingHorizontal={8}
          paddingVertical={2}
          position="absolute"
          right={-8}
          top={-10}
        >
          <TrendingDown color="white" size={12} strokeWidth={2.5} />
          <Paragraph
            color="white"
            fontSize={11}
            fontWeight="800"
            lineHeight={15}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
          >
            %{discount.discountRate.toLocaleString('tr-TR')}
          </Paragraph>
        </XStack>
      ) : null}
    </YStack>
  );
}
