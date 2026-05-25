import { useLocalSearchParams } from 'expo-router';
import { ProductListScreen } from '@/features/product/screens/product-list-screen';

export default function CategoryRoute() {
  const { slug, c, q } = useLocalSearchParams<{ slug: string; c?: string; q?: string }>();

  const categoryId = c ? parseInt(c, 10) : undefined;
  const parsedCategoryId = categoryId && !isNaN(categoryId) ? categoryId : undefined;

  return (
    <ProductListScreen
      slug={slug}
      categoryId={parsedCategoryId}
      searchQuery={q}
    />
  );
}
