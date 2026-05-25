import { FlashList } from '@shopify/flash-list';
import { YStack } from 'tamagui';
import { ProductCard } from '@/features/product/components/product-card';
import { tokenValues } from '@/lib/theme/token-values';
import { Product } from '@/types/product.types';

type ProductGridProps = {
  onProductPress: (product: Product) => void;
  products: Product[];
};

export function ProductGrid({
  onProductPress,
  products,
}: ProductGridProps) {
  return (
    <FlashList
      contentContainerStyle={{
        paddingBottom: tokenValues.sectionListPaddingBottom,
      }}
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={({ item }) => (
        <YStack flex={1} padding="$2">
          <ProductCard
            onOpen={() => onProductPress(item)}
            product={item}
          />
        </YStack>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
