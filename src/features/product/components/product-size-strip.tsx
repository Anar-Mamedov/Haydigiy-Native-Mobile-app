import { ScrollView } from 'react-native';
import { XStack, styled } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { ProductSize } from '@/types/product.types';

type ProductSizeStripProps = {
  sizes?: ProductSize[];
  testID?: string;
};

const SIZE_STRIP_TEST_ID = 'product-size-strip';

/**
 * Beden çipi. Stok durumu tek bir varyantla ifade edilir; renkler tema
 * token'larından gelir ki çip koyu temada da kart yüzeyiyle uyumlu kalsın.
 */
const SizeChip = styled(XStack, {
  name: 'ProductSizeChip',
  alignItems: 'center',
  borderRadius: 4,
  borderWidth: 1,
  justifyContent: 'center',
  paddingHorizontal: 6,
  paddingVertical: 2,

  variants: {
    available: {
      true: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
      },
      false: {
        backgroundColor: '$color2',
        borderColor: '$color4',
        opacity: 0.6,
      },
    },
  } as const,
});

function getSizeAccessibilityLabel({ hasStock, name }: ProductSize) {
  return hasStock ? `${name} beden, stokta var` : `${name} beden, tükendi`;
}

/**
 * Ürün kartındaki beden listesi. Beden sayısı kart genişliğini kolayca aştığı
 * için liste yatayda kaydırılabilir olmalı; bu yüzden bileşen bir basılabilir
 * alanın (Pressable) içine yerleştirilmemeli, yoksa kaydırma hareketi karta
 * gider ve kullanıcı ekran dışında kalan bedenleri hiç göremez.
 */
export function ProductSizeStrip({ sizes, testID = SIZE_STRIP_TEST_ID }: ProductSizeStripProps) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <ScrollView
      alwaysBounceHorizontal={false}
      contentContainerStyle={{ alignItems: 'center', gap: 4, paddingRight: 2 }}
      directionalLockEnabled
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      testID={testID}
    >
      {sizes.map((size, index) => (
        <SizeChip
          accessibilityLabel={getSizeAccessibilityLabel(size)}
          available={size.hasStock}
          key={`${size.name}-${index}`}
        >
          <Paragraph
            color={size.hasStock ? '$color' : '$color8'}
            fontSize={12}
            fontWeight="400"
            maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
            style={{ textDecorationLine: size.hasStock ? 'none' : 'line-through' }}
          >
            {size.name}
          </Paragraph>
        </SizeChip>
      ))}
    </ScrollView>
  );
}
