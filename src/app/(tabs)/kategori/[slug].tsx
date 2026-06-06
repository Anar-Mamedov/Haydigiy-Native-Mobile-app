import { useLocalSearchParams } from 'expo-router';
import { ProductListScreen } from '@/features/product/screens/product-list-screen';

export default function CategoryRoute() {
  const { slug, c, q } = useLocalSearchParams<{ slug: string; c?: string; q?: string }>();

  const categoryId = c ? parseInt(c, 10) : undefined;
  const parsedCategoryId = categoryId && !isNaN(categoryId) ? categoryId : undefined;

  // kategori/[slug] is a single Tabs.Screen, so React Navigation reuses one
  // ProductListScreen instance across categories and only swaps the param. That
  // leaks the previous category's FlashList layout (intermittent top gap) and its
  // filter/sort state. Key by the category identity to force a fresh mount per
  // category, exactly as a stack push would.
  return (
    <ProductListScreen
      key={`${slug ?? ''}-${parsedCategoryId ?? ''}-${q ?? ''}`}
      slug={slug}
      categoryId={parsedCategoryId}
      searchQuery={q}
    />
  );
}
