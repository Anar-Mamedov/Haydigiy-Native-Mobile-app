import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BundleItem } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';

export type BundleItemPriceProps = Pick<BundleItem, 'price' | 'oldPrice'>;

/**
 * Paket kalemindeki "Tekli alırsan / Pakette alırsan" fiyat karşılaştırması; webdeki
 * `BundleItemPrice` ile aynı dil. Tekli fiyat `$singlePrice` kırmızısıyla üstü çizili, paket
 * içi fiyat `$discount` yeşiliyle kalın gösterilir. Etiketler sayesinde fark yalnızca renge
 * bağlı kalmaz.
 *
 * Tekli fiyat paket fiyatından yüksek değilse karşılaştırılacak bir avantaj olmadığı için
 * yalnızca fiyat gösterilir; fiyatı olmayan kalemde hiçbir şey çizilmez.
 */
export function BundleItemPrice({ price, oldPrice }: BundleItemPriceProps) {
  if (price <= 0) return null;

  const priceLabel = formatCurrency(price);

  if (oldPrice === null || oldPrice <= price) {
    return (
      <YStack accessibilityLabel={`Paket içi fiyatı ${priceLabel}`} accessible alignItems="flex-end">
        <Paragraph color="$color" fontSize={13} fontWeight="700">
          {priceLabel}
        </Paragraph>
      </YStack>
    );
  }

  const singlePriceLabel = formatCurrency(oldPrice);

  return (
    <YStack
      // Ekran okuyucu üstü çizili fiyatı ayırt edemez; karşılaştırma tek cümlede okunur.
      accessibilityLabel={`Tekli alırsan ${singlePriceLabel}, pakette alırsan ${priceLabel}`}
      accessible
      alignItems="flex-end"
    >
      {/* Satır yükseklikleri webdeki sıkı blokla aynı dursun diye açıkça verilir (varsayılan 23). */}
      <Paragraph color="$color10" fontSize={10} fontWeight="500" lineHeight={13}>
        Tekli alırsan
      </Paragraph>
      <Paragraph color="$singlePrice" fontSize={11} fontWeight="600" lineHeight={14} textDecorationLine="line-through">
        {singlePriceLabel}
      </Paragraph>
      <Paragraph color="$discount" fontSize={10} fontWeight="600" lineHeight={13} marginTop="$1.5">
        Pakette alırsan
      </Paragraph>
      <Paragraph color="$discount" fontSize={14} fontWeight="800" lineHeight={18}>
        {priceLabel}
      </Paragraph>
    </YStack>
  );
}
