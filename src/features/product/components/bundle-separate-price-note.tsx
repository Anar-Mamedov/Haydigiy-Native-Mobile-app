import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { formatProductPrice } from '../utils/product-price';

type BundleSeparatePriceNoteProps = {
  /** Paketteki ürünlerin tekil fiyat toplamı. */
  itemsTotal: number;
  testID?: string;
};

/**
 * Liste kartında paket fiyatının altındaki "Ayrı ayrı alırsan 339,98 TL" satırı; webdeki notla ve
 * detaydaki paket kutusuyla aynı dil. Toplam `$singlePrice` kırmızısıyla üstü çizili gösterilir;
 * etiket, çizili tutarın ne olduğunu renge bağlı kalmadan anlatır.
 */
export function BundleSeparatePriceNote({
  itemsTotal,
  testID = 'bundle-separate-price-note',
}: BundleSeparatePriceNoteProps) {
  const totalLabel = formatProductPrice(itemsTotal);
  if (!totalLabel) return null;

  return (
    <XStack
      // Ekran okuyucu üstü çizili tutarı ayırt edemez; satır tek cümle olarak okunur.
      accessibilityLabel={`Ayrı ayrı alırsan ${totalLabel}`}
      accessibilityRole="text"
      accessible
      alignItems="center"
      flexWrap="wrap"
      gap={4}
      testID={testID}
    >
      <Paragraph color="$color10" fontSize={11} lineHeight={15}>
        Ayrı ayrı alırsan
      </Paragraph>
      <Paragraph color="$singlePrice" fontSize={11} fontWeight="600" lineHeight={15} textDecorationLine="line-through">
        {totalLabel}
      </Paragraph>
    </XStack>
  );
}
