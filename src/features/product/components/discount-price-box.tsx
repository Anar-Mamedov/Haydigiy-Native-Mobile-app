import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { DiscountRateBadge } from '@/components/ui/discount-rate-badge';

export type DiscountPriceBoxProps = {
  /** Ekran okuyucular kutuyu parça parça değil tek cümle olarak duysun. */
  accessibilityLabel: string;
  /** Sağ üst rozetteki yüzde; yoksa rozet çizilmez. */
  discountRate?: number;
  maxFontSizeMultiplier?: number;
  /** Güncel/geçerli fiyatın biçimlenmiş metni. */
  priceLabel: string;
  /** Üstü çizili karşılaştırma fiyatı; yoksa satır tek fiyattan oluşur. */
  previousPriceLabel?: string;
  /** Satır yüksekliklerini kullanıcının yazı ölçeğiyle birlikte büyütür. */
  scale?: number;
  testID?: string;
};

/**
 * Ürün detayındaki yeşil fiyat kutusunun ortak gövdesi: üstü çizili karşılaştırma
 * fiyatı, vurgulu güncel fiyat ve sağ üst köşede indirim oranı rozeti.
 *
 * Yalnızca sunumdan sorumludur — hangi sayının nereden geldiği ve nasıl
 * biçimlendirildiği çağıranın işidir. Böylece indirimli tekil ürün ile paket
 * toplamı aynı görsel dili tek bir yerden paylaşır.
 */
export function DiscountPriceBox({
  accessibilityLabel,
  discountRate,
  maxFontSizeMultiplier,
  priceLabel,
  previousPriceLabel,
  scale = 1,
  testID,
}: DiscountPriceBoxProps) {
  return (
    <YStack
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      accessible
      backgroundColor="$discountBackground"
      borderColor="$discount"
      borderRadius={8}
      borderWidth={1}
      paddingHorizontal={10}
      paddingVertical={6}
      position="relative"
      testID={testID}
    >
      <XStack alignItems="baseline" gap={6}>
        {previousPriceLabel ? (
          <Paragraph
            color="$color10"
            fontSize={13}
            fontWeight="600"
            lineHeight={Math.round(17 * scale)}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            textDecorationLine="line-through"
          >
            {previousPriceLabel}
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

      <DiscountRateBadge
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        position="absolute"
        rate={discountRate}
        right={-8}
        size="sm"
        top={-10}
      />
    </YStack>
  );
}
