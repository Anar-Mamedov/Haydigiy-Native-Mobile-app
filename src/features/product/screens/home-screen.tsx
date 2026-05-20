import { useRouter } from 'expo-router';
import { ShoppingBag } from '@tamagui/lucide-icons-2';
import { H1, Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppButton, AppScreen, EmptyState, SectionCard, ThemeToggle } from '@/components/ui';
import { CartSummaryCard } from '@/features/cart/components/cart-summary-card';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { useFeaturedProductsQuery } from '@/features/product/api/product.queries';
import { ProductGrid } from '@/features/product/components/product-grid';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { Product } from '@/types/product.types';

export function HomeScreen() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { data, isError, isPending, refetch } = useFeaturedProductsQuery();
  const { setThemePreference, themePreference } = useAppTheme();

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      params: { id: product.id },
      pathname: '/product/[id]',
    });
  };

  return (
    <AppScreen scrollable={false}>
      <YStack gap="$4">
        <SectionCard>
          <YStack gap="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <YStack gap="$2">
                <XStack alignItems="center" gap="$2">
                  <ShoppingBag color="$color" size={24} />
                  <H1 size="$9">HaydiGiy</H1>
                </XStack>
                <Paragraph color="$color10">
                  Trendyol-style mobile commerce starter built with Expo Router, Tamagui, Query,
                  and Zustand persistence.
                </Paragraph>
              </YStack>
            </XStack>
            <ThemeToggle onValueChange={setThemePreference} value={themePreference} />
            <XStack gap="$3">
              <AppButton flex={1} onPress={() => router.push('/(tabs)/cart')}>
                Open cart
              </AppButton>
              <AppButton flex={1} onPress={() => router.push('/checkout')}>
                Checkout
              </AppButton>
            </XStack>
          </YStack>
        </SectionCard>

        <CartSummaryCard />

        <YStack flex={1} gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <YStack gap="$1">
              <Paragraph fontSize="$6" fontWeight="700">
                Featured picks
              </Paragraph>
              <Paragraph color="$color10">
                FlashList + Expo Image + reusable Tamagui product cards
              </Paragraph>
            </YStack>
          </XStack>

          {isPending ? (
            <SectionCard>
              <XStack alignItems="center" gap="$3" justifyContent="center" padding="$4">
                <Spinner />
                <Paragraph>Loading featured products...</Paragraph>
              </XStack>
            </SectionCard>
          ) : null}

          {isError ? (
            <EmptyState
              actionLabel="Retry loading"
              description="The product feed could not be loaded. Retry the query to verify the data flow."
              onActionPress={() => refetch()}
              title="Unable to load featured products"
            />
          ) : null}

          {!isPending && !isError && data?.length === 0 ? (
            <EmptyState
              description="No products were returned for the featured feed."
              title="Featured feed is empty"
            />
          ) : null}

          {!isPending && !isError && data?.length ? (
            <YStack flex={1}>
              <ProductGrid
                onAddToCart={handleAddToCart}
                onProductPress={handleProductPress}
                products={data}
              />
            </YStack>
          ) : null}
        </YStack>
      </YStack>
    </AppScreen>
  );
}
