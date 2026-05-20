import { H2, Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppScreen, EmptyState, SectionCard } from '@/components/ui';
import { useFeaturedProductsQuery } from '@/features/product/api/product.queries';

export function CategoriesScreen() {
  const { data, isError, isPending, refetch } = useFeaturedProductsQuery();
  const categories = Array.from(new Set((data ?? []).map((product) => product.category)));

  return (
    <AppScreen>
      <YStack gap="$2">
        <H2>Categories</H2>
        <Paragraph color="$color10">
          Feature routes stay thin while category data remains driven by product queries.
        </Paragraph>
      </YStack>

      {isPending ? (
        <SectionCard>
          <XStack alignItems="center" gap="$3" justifyContent="center" padding="$4">
            <Spinner />
            <Paragraph>Loading categories...</Paragraph>
          </XStack>
        </SectionCard>
      ) : null}

      {isError ? (
        <EmptyState
          actionLabel="Retry loading"
          description="Category feed could not be derived from the product query."
          onActionPress={() => refetch()}
          title="Unable to load categories"
        />
      ) : null}

      {!isPending && !isError && categories.length === 0 ? (
        <EmptyState
          description="No categories were derived from the current product payload."
          title="No categories found"
        />
      ) : null}

      {!isPending && !isError && categories.length > 0 ? (
        <YStack gap="$3">
          {categories.map((category) => {
            const productCount =
              data?.filter((product) => product.category === category).length ?? 0;

            return (
              <SectionCard key={category}>
                <YStack gap="$2">
                  <Paragraph fontSize="$6" fontWeight="700">
                    {category}
                  </Paragraph>
                  <Paragraph color="$color10">
                    {productCount} products ready for filtering
                  </Paragraph>
                </YStack>
              </SectionCard>
            );
          })}
        </YStack>
      ) : null}
    </AppScreen>
  );
}
