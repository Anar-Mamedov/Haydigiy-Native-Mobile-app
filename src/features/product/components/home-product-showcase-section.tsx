import { Pressable } from 'react-native';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight } from '@/components/ui/icons';
import { getShowcaseProductKey, ProductShowcase, ShowcaseProduct } from '../api/product-showcase.mapper';
import { ShowcaseProductCard } from './showcase-product-card';

type HomeProductShowcaseSectionProps = {
  showcase: ProductShowcase;
  onProductPress: (product: ShowcaseProduct) => void;
  onAddToCartPress: (product: ShowcaseProduct) => void;
  onCtaPress: () => void;
};

const SECTION_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';
const SECTION_PADDING = 16;

/** Ana sayfa ürün vitrini ("Öne Çıkanlar", "Yeni Gelenler"): başlık ve yatay kaydırılan kartlar. */
export function HomeProductShowcaseSection({
  showcase,
  onProductPress,
  onAddToCartPress,
  onCtaPress,
}: HomeProductShowcaseSectionProps) {
  const { title, subtitle, ctaLabel, ctaLink, products } = showcase;
  if (products.length === 0) return null;

  const hasCta = Boolean(ctaLabel && ctaLink);
  const hasHeader = Boolean(title || subtitle || hasCta);

  return (
    <YStack
      backgroundColor="$background"
      borderRadius={16}
      boxShadow={SECTION_SHADOW}
      overflow="hidden"
      paddingVertical={SECTION_PADDING}
      testID="home-product-showcase"
      width="100%"
    >
      {hasHeader ? (
        <XStack alignItems="center" gap="$2" justifyContent="space-between" marginBottom={12} paddingHorizontal={SECTION_PADDING}>
          <YStack flex={1}>
            {title ? (
              <Paragraph accessibilityRole="header" color="$color" fontSize={16} fontWeight="800" numberOfLines={1}>
                {title}
              </Paragraph>
            ) : null}
            {subtitle ? (
              <Paragraph color="$color10" fontSize={12} fontWeight="500" marginTop={2} numberOfLines={2}>
                {subtitle}
              </Paragraph>
            ) : null}
          </YStack>
          {hasCta ? (
            <Pressable accessibilityLabel={`${title || 'Vitrin'}: ${ctaLabel}`} accessibilityRole="link" hitSlop={8} onPress={onCtaPress}>
              {({ pressed }) => (
                <XStack alignItems="center" gap={2} opacity={pressed ? 0.7 : 1}>
                  <Paragraph color="$brand" fontSize={12} fontWeight="700">
                    {ctaLabel}
                  </Paragraph>
                  <ChevronRight color="$brand" size={14} />
                </XStack>
              )}
            </Pressable>
          ) : null}
        </XStack>
      ) : null}

      <ScrollView
        contentContainerStyle={{ gap: 12, paddingBottom: 4, paddingHorizontal: SECTION_PADDING }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {products.map((product, index) => (
          <ShowcaseProductCard
            key={`${getShowcaseProductKey(product)}-${index}`}
            onAddToCartPress={onAddToCartPress}
            onPress={onProductPress}
            product={product}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}
