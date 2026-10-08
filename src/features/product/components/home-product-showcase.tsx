import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { ProductShowcaseContent } from '@/types/page-design.types';
import { handleLinkPress } from '@/utils/link-handler';
import { mapProductShowcaseContent, ShowcaseProduct } from '../api/product-showcase.mapper';
import { useShowcaseQuickAdd } from '../hooks/use-showcase-quick-add';
import { buildShowcaseProductRoute } from '../utils/showcase-product-route';
import { HomeProductShowcaseSection } from './home-product-showcase-section';
import { ShowcaseQuickAddSheet } from './showcase-quick-add-sheet';

type HomeProductShowcaseProps = {
  content: ProductShowcaseContent;
};

/** Sayfa tasarımındaki `product_showcase` bölümü: veriyi eşler, yönlendirme ve hızlı sepete eklemeyi bağlar. */
export function HomeProductShowcase({ content }: HomeProductShowcaseProps) {
  const router = useRouter();
  const showcase = useMemo(() => mapProductShowcaseContent(content), [content]);
  const quickAdd = useShowcaseQuickAdd();

  const handleProductPress = useCallback(
    (product: ShowcaseProduct) => router.push(buildShowcaseProductRoute(product) as never),
    [router],
  );

  // Ürünsüz vitrin, ana sayfa aralığında boş bir satır bırakmasın.
  if (showcase.products.length === 0) return null;

  return (
    <YStack width="100%">
      <HomeProductShowcaseSection
        onAddToCartPress={quickAdd.open}
        onCtaPress={() => handleLinkPress(showcase.ctaLink)}
        onProductPress={handleProductPress}
        showcase={showcase}
      />
      {quickAdd.isOpen ? <ShowcaseQuickAddSheet controller={quickAdd} /> : null}
    </YStack>
  );
}
