import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { H2, Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppButton, AppScreen, EmptyState, SectionCard } from '@/components/ui';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { useProductByIdQuery } from '@/features/product/api/product.queries';
import { tokenValues } from '@/lib/theme/token-values';
import { formatCurrency } from '@/utils/format-currency';

export function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addItem = useCartStore((state) => state.addItem);
  const { data, isError, isPending, refetch } = useProductByIdQuery(id ?? '');

  return (
    <AppScreen>
      {isPending ? (
        <SectionCard>
          <XStack alignItems="center" gap="$3" justifyContent="center" padding="$4">
            <Spinner />
            <Paragraph>Loading product details...</Paragraph>
          </XStack>
        </SectionCard>
      ) : null}

      {isError ? (
        <EmptyState
          actionLabel="Retry"
          description="This product could not be loaded. Retry the detail query."
          onActionPress={() => refetch()}
          title="Product unavailable"
        />
      ) : null}

      {!isPending && !isError && !data ? (
        <EmptyState
          description="The selected product was not found in the current data source."
          title="Product not found"
        />
      ) : null}

      {data ? (
        <YStack gap="$4">
          <SectionCard>
            <YStack gap="$4">
              <Image
                contentFit="cover"
                source={{ uri: data.imageUrl }}
                style={{
                  borderRadius: tokenValues.productImageRadius,
                  height: 320,
                  width: '100%',
                }}
              />
              <YStack gap="$2">
                <Paragraph color="$color10">{data.brand}</Paragraph>
                <H2>{data.title}</H2>
                <Paragraph color="$color10">{data.description}</Paragraph>
                <Paragraph fontSize="$8" fontWeight="700">
                  {formatCurrency(data.price)}
                </Paragraph>
                <Paragraph color="$color10">
                  Seller: {data.sellerName} • {data.shippingLabel}
                </Paragraph>
              </YStack>
              <XStack gap="$3">
                <AppButton flex={1} onPress={() => addItem(data)}>
                  Add to cart
                </AppButton>
                <AppButton flex={1} onPress={() => router.push('/checkout')}>
                  Buy now
                </AppButton>
              </XStack>
            </YStack>
          </SectionCard>
        </YStack>
      ) : null}
    </AppScreen>
  );
}
