import { useLocalSearchParams } from 'expo-router';
import { ProductListScreen } from '@/features/product/screens/product-list-screen';

export default function CategoryRoute() {
  const { slug, c, q } = useLocalSearchParams<{ slug: string; c?: string; q?: string }>();

  const categoryId = c ? parseInt(c, 10) : undefined;
  const parsedCategoryId = categoryId && !isNaN(categoryId) ? categoryId : undefined;

  // kategori/[slug] can be replaced with a new category while the route stays
  // mounted, so key by category identity to reset FlashList layout and filter
  // state between category/search transitions.
  return (
    <ProductListScreen
      key={`${slug ?? ''}-${parsedCategoryId ?? ''}-${q ?? ''}`}
      slug={slug}
      categoryId={parsedCategoryId}
      searchQuery={q}
    />
  );
}
