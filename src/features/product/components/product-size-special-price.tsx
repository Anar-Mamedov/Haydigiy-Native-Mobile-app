import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ProductSize } from '@/types/product.types';
import { formatProductPrice } from '../utils/product-price';
import { formatSizeSpecialPriceLabel, resolveSizeSpecialPrice } from '../utils/variant-price';

type ProductSizeSpecialPriceProps = {
  productPrice: number;
  sizes?: ProductSize[];
  testID?: string;
};

/**
 * Liste kartında ürün fiyatından ucuza satılan bedeni duyurur: "S bedenine özel 299,99 TL".
 * Böyle bir beden yoksa hiçbir şey çizmez. Renkler indirim token'larından gelir; satır koyu
 * temada da okunur kalır.
 */
export function ProductSizeSpecialPrice({
  productPrice,
  sizes,
  testID = 'product-size-special-price',
}: ProductSizeSpecialPriceProps) {
  const specialPrice = resolveSizeSpecialPrice(sizes, productPrice);
  if (!specialPrice) return null;

  const label = formatSizeSpecialPriceLabel(specialPrice.sizeNames);
  const priceLabel = formatProductPrice(specialPrice.price);

  return (
    <XStack
      accessibilityLabel={`${label} ${priceLabel}`}
      accessibilityRole="text"
      accessible
      alignSelf="flex-start"
      backgroundColor="$discountBackground"
      borderRadius={4}
      paddingHorizontal={6}
      paddingVertical={2}
      testID={testID}
    >
      <Paragraph color="$discount" fontSize={11} lineHeight={15}>
        {label}{' '}
        <Paragraph color="$discount" fontSize={11} fontWeight="700" lineHeight={15}>
          {priceLabel}
        </Paragraph>
      </Paragraph>
    </XStack>
  );
}
