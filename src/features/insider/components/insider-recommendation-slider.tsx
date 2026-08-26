import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { formatCurrency } from '@/utils/format-currency';
import { InsiderRecommendedProduct } from '../utils/insider-recommendation.mapper';

type InsiderRecommendationSliderProps = {
  title: string;
  products: InsiderRecommendedProduct[];
  isLoading: boolean;
  isError: boolean;
  onProductPress: (product: InsiderRecommendedProduct) => void;
  onRetry: () => void;
};

type RecommendationCardProps = {
  onPress: (product: InsiderRecommendedProduct) => void;
  product: InsiderRecommendedProduct;
};

const CARD_WIDTH = 132;

function RecommendationCard({ onPress, product }: RecommendationCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Önerilen ürünü aç: ${product.name}`}
      accessibilityRole="button"
      onPress={() => onPress(product)}
      style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
    >
      <YStack
        backgroundColor="$background"
        borderColor="$borderColor"
        borderRadius={6}
        borderWidth={1}
        overflow="hidden"
        width={CARD_WIDTH}
      >
        <YStack aspectRatio={3 / 4} backgroundColor="$backgroundHover">
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
        <YStack backgroundColor="$background" gap="$1" minHeight={70} padding="$2">
          {product.brand ? (
            <Paragraph color="$color10" fontSize={10} fontWeight="700" numberOfLines={1}>
              {product.brand}
            </Paragraph>
          ) : null}
          <Paragraph color="$color" fontSize={11} fontWeight="600" lineHeight={14} numberOfLines={2}>
            {product.name}
          </Paragraph>
          {product.price !== null ? (
            <XStack alignItems="center" gap="$1.5">
              <Paragraph color="$brand" fontSize={12} fontWeight="800">
                {formatCurrency(product.price)}
              </Paragraph>
              {product.originalPrice !== null ? (
                <Paragraph
                  color="$color10"
                  fontSize={10}
                  textDecorationLine="line-through"
                >
                  {formatCurrency(product.originalPrice)}
                </Paragraph>
              ) : null}
            </XStack>
          ) : null}
        </YStack>
      </YStack>
    </Pressable>
  );
}

function RecommendationSkeleton() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 10 }}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {[0, 1, 2].map((item) => (
        <YStack
          accessibilityLabel="Öneriler yükleniyor"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius={6}
          borderWidth={1}
          key={item}
          overflow="hidden"
          width={CARD_WIDTH}
        >
          <YStack aspectRatio={3 / 4} backgroundColor="$color4" opacity={0.5} />
          <YStack gap="$2" padding="$2">
            <YStack backgroundColor="$color4" borderRadius={4} height={10} opacity={0.6} width="100%" />
            <YStack backgroundColor="$color4" borderRadius={4} height={10} opacity={0.6} width="70%" />
          </YStack>
        </YStack>
      ))}
    </ScrollView>
  );
}

/**
 * Smart Recommender sonucunu yatay bir slider olarak çizer.
 *
 * Yalnızca sunum yapar: veri çekme, tıklama loglama ve yönlendirme
 * `InsiderRecommendationSection` tarafındadır. Öneri bulunamadığında hiçbir şey
 * render edilmez — boş bir başlık bırakmak ekranı bozar.
 */
export function InsiderRecommendationSlider({
  title,
  products,
  isLoading,
  isError,
  onProductPress,
  onRetry,
}: InsiderRecommendationSliderProps) {
  const isEmpty = !isLoading && !isError && products.length === 0;
  if (isEmpty) return null;

  return (
    <YStack gap="$2" paddingTop="$5" testID="insider-recommendation-slider">
      <XStack alignItems="center" height={24} justifyContent="space-between" paddingHorizontal="$4">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          {title}
        </Paragraph>
        {isError ? (
          <Pressable
            accessibilityLabel="Önerileri tekrar dene"
            accessibilityRole="button"
            onPress={onRetry}
          >
            {({ pressed }) => (
              <Paragraph color="$brand" fontSize={12} fontWeight="600" opacity={pressed ? 0.7 : 1}>
                Tekrar Dene
              </Paragraph>
            )}
          </Pressable>
        ) : null}
      </XStack>

      {isLoading ? (
        <RecommendationSkeleton />
      ) : isError ? (
        <Paragraph color="$color10" fontSize={14} marginTop="$2" paddingHorizontal="$4">
          Öneriler yüklenemedi.
        </Paragraph>
      ) : (
        <ScrollView
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingTop: 10 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {products.map((product) => (
            <RecommendationCard key={product.id} onPress={onProductPress} product={product} />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
