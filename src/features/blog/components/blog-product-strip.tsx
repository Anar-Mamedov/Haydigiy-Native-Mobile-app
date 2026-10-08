import { Pressable } from 'react-native';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogRelatedProduct } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';
import { BlogImage } from './blog-image';

const PRODUCT_CARD_WIDTH = 148;

type BlogProductStripProps = {
  products: BlogRelatedProduct[];
  onProductPress: (product: BlogRelatedProduct) => void;
};

/**
 * "Yazıdaki ürünler" şeridi (web `BlogProductStrip`). Web geniş ekranda aynı
 * ürünleri yazının iki yanındaki sabit raylarda gösteriyor; telefon ve tablet
 * genişliklerinde yalnızca bu yatay şerit kullanılıyor. Kart ürün detayını açar.
 */
export function BlogProductStrip({ products, onProductPress }: BlogProductStripProps) {
  if (products.length === 0) return null;

  return (
    <YStack gap="$4" testID="blog-product-strip">
      <XStack alignItems="flex-end" borderBottomColor="$color" borderBottomWidth={1} justifyContent="space-between" paddingBottom="$3">
        <Paragraph accessibilityRole="header" color="$brand" fontSize={10} fontWeight="700" letterSpacing={2} textTransform="uppercase">
          {BLOG_TEXTS.productsTitle}
        </Paragraph>
        {products.length > 2 ? (
          <Paragraph color="$color9" fontSize={10} fontWeight="700" letterSpacing={1.5} textTransform="uppercase">
            {BLOG_TEXTS.scrollHint}
          </Paragraph>
        ) : null}
      </XStack>

      <ScrollView
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16 }}
        horizontal
        marginHorizontal={-16}
        showsHorizontalScrollIndicator={false}
      >
        {products.map((product) => (
          <Pressable
            accessibilityLabel={product.priceLabel ? `${product.name}, ${product.priceLabel}` : product.name}
            accessibilityRole="link"
            key={product.id || product.slug}
            onPress={() => onProductPress(product)}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: PRODUCT_CARD_WIDTH })}
            testID={`blog-product-${product.slug}`}
          >
            <YStack gap="$1">
              <BlogImage alt={product.name} aspectRatio={3 / 4} placeholderSize={28} uri={product.imageUrl} />
              <Paragraph color="$color" fontSize={13} fontWeight="600" lineHeight={19} marginTop="$2" numberOfLines={2}>
                {product.name}
              </Paragraph>
              {product.priceLabel ? (
                <Paragraph color="$color10" fontSize={13}>
                  {product.priceLabel}
                </Paragraph>
              ) : null}
            </YStack>
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  );
}
