import { useLocalSearchParams } from 'expo-router';
import { ProductListScreen } from '@/features/product/screens/product-list-screen';
import {
  buildProductListingKey,
  parseProductListingTarget,
} from '@/features/product/utils/listing-deep-link-params';

export default function CategoryRoute() {
  const params = useLocalSearchParams();
  const slug = typeof params.slug === 'string' ? params.slug : undefined;

  // Sıralama/filtre parametreleri de okunur: derin bağlantıyla gelen liste
  // uygulamada da web'deki seçimlerle açılmalı.
  const target = parseProductListingTarget(params);

  // kategori/[slug] can be replaced with a new category while the route stays
  // mounted, so key by listing identity to reset FlashList layout and filter
  // state between category/search/filter transitions.
  return (
    <ProductListScreen
      key={buildProductListingKey(slug, target)}
      categoryId={target.categoryId}
      initialFilters={target.filters}
      searchQuery={target.searchQuery}
      slug={slug ?? ''}
    />
  );
}
