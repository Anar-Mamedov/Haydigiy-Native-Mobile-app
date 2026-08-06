import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

import { formatCurrency } from '@/utils/format-currency';
import { PopularProduct } from '@/types/product.types';

type PopularProductsSectionProps = {
  isEmpty: boolean;
  isError: boolean;
  isLoading: boolean;
  onProductPress: (product: PopularProduct) => void;
  onRetry: () => void;
  products: PopularProduct[];
};

type PopularProductCardProps = {
  onPress: (product: PopularProduct) => void;
  product: PopularProduct;
};

function PopularProductCard({ onPress, product }: PopularProductCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Popüler ürünü aç: ${product.name}`}
      accessibilityRole="button"
      onPress={() => onPress(product)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <YStack
        backgroundColor="$background"
        borderColor="$borderColor"
        borderRadius={6}
        borderWidth={1}
        shadowColor="$shadowColor"
        shadowRadius={3}
        shadowOffset={{ width: 0, height: 1 }}
        overflow="hidden"
        width={116}
      >
        <YStack aspectRatio={3 / 4} backgroundColor="$backgroundHover" position="relative">
          {product.imageUrl ? (
            <Image
              accessibilityLabel={`${product.name} görseli`}
              contentFit="contain"
              source={{ uri: product.imageUrl }}
              style={{ height: '100%', width: '100%' }}
            />
          ) : (
            <YStack alignItems="center" flex={1} justifyContent="center">
              <Paragraph color="$color10" fontSize={20} fontWeight="700">
                Ü
              </Paragraph>
            </YStack>
          )}
        </YStack>
        <YStack minHeight={64} padding="$2" gap="$1" backgroundColor="$background">
          <Paragraph color="$color" fontSize={11} fontWeight="600" lineHeight={14} numberOfLines={2}>
            {product.name}
          </Paragraph>
          {product.price !== null ? (
            <Paragraph color="$brand" fontSize={12} fontWeight="800">
              {formatCurrency(product.price)}
            </Paragraph>
          ) : null}
        </YStack>
      </YStack>
    </Pressable>
  );
}

function PopularProductsSkeleton() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 10 }}>
      {[0, 1, 2].map((item) => (
        <YStack
          accessibilityLabel="Popüler ürün yükleniyor"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius={6}
          borderWidth={1}
          key={item}
          overflow="hidden"
          width={116}
        >
          <YStack aspectRatio={3 / 4} backgroundColor="$color4" opacity={0.5} />
          <YStack padding="$2" gap="$2">
            <YStack height={10} width="100%" backgroundColor="$color4" borderRadius={4} opacity={0.6} />
            <YStack height={10} width="70%" backgroundColor="$color4" borderRadius={4} opacity={0.6} />
          </YStack>
        </YStack>
      ))}
    </ScrollView>
  );
}

export function PopularProductsSection({
  isEmpty,
  isError,
  isLoading,
  onProductPress,
  onRetry,
  products,
}: PopularProductsSectionProps) {
  return (
    <YStack paddingTop="$5" gap="$2" testID="popular-products-section">
      <XStack alignItems="center" height={24} justifyContent="space-between" paddingHorizontal="$4">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          Popüler Ürünler
        </Paragraph>
        {isError ? (
          <Pressable accessibilityLabel="Popüler ürünleri tekrar dene" accessibilityRole="button" onPress={onRetry}>
            {({ pressed }) => (
              <Paragraph color="$brand" fontSize={12} fontWeight="600" opacity={pressed ? 0.7 : 1}>
                Tekrar Dene
              </Paragraph>
            )}
          </Pressable>
        ) : null}
      </XStack>

      {isLoading ? (
        <PopularProductsSkeleton />
      ) : isError ? (
        <Paragraph color="$color10" fontSize={14} paddingHorizontal="$4" marginTop="$2">
          Popüler ürünler yüklenemedi.
        </Paragraph>
      ) : isEmpty ? (
        <Paragraph color="$color10" fontSize={14} paddingHorizontal="$4" marginTop="$2">
          Popüler ürün bulunamadı.
        </Paragraph>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 10 }}>
          {products.map((product) => (
            <PopularProductCard key={product.id} onPress={onProductPress} product={product} />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
