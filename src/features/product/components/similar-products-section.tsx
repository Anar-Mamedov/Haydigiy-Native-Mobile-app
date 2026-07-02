import React from 'react';
import { XStack, YStack, Paragraph, useThemeName } from 'tamagui';
import { Image } from 'expo-image';
import { Pressable, ScrollView } from 'react-native';
import { formatCurrency } from '@/utils/format-currency';
import { SimilarProduct } from '@/types/product.types';

interface SimilarProductsSectionProps {
  products?: SimilarProduct[];
  /** Receives the full product so the target screen can render an instant preview. */
  onProductPress: (product: SimilarProduct) => void;
}

export function SimilarProductsSection({
  products = [],
  onProductPress,
}: SimilarProductsSectionProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

  if (!products || products.length === 0) return null;

  return (
    <YStack gap="$3" padding="$4" backgroundColor="$background" borderTopWidth={8} borderTopColor="$color3">
      <Paragraph fontSize={15} fontWeight="700" color="$color">
        Benzer Ürünler
      </Paragraph>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
      >
        {products.map((similarProduct) => (
          <Pressable
            key={similarProduct.id}
            onPress={() => onProductPress(similarProduct)}
            style={{
              width: 130,
              borderWidth: 1,
              borderColor: isDark ? '#374151' : '#E5E7EB',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: isDark ? '#1F2937' : 'white',
            }}
          >
            <YStack width="100%">
              {/* Product Thumbnail (square, 1:1) */}
              <YStack aspectRatio={1} backgroundColor="$color2" position="relative">
                <Image
                  source={{ uri: similarProduct.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                />
                
                {!similarProduct.hasStock && (
                  <XStack
                    position="absolute"
                    top={4}
                    left={4}
                    backgroundColor="#ef4444"
                    paddingHorizontal={6}
                    paddingVertical={2}
                    borderRadius={4}
                  >
                    <Paragraph color="white" fontSize={9} fontWeight="700">
                      Tükendi
                    </Paragraph>
                  </XStack>
                )}
              </YStack>

              {/* Text content details */}
              <YStack padding="$2" gap="$1">
                <Paragraph fontSize={12} color="$color" numberOfLines={2} height={36} lineHeight={16}>
                  {similarProduct.name}
                </Paragraph>
                <Paragraph fontSize={13} fontWeight="800" color="$brand">
                  {formatCurrency(similarProduct.price)}
                </Paragraph>
              </YStack>
            </YStack>
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  );
}
