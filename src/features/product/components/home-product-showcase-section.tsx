import { Pressable } from 'react-native';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight } from '@/components/ui/icons';
import { getShowcaseProductKey, ProductShowcase, ShowcaseProduct } from '../api/product-showcase.mapper';
import { ShowcaseProductCard } from './showcase-product-card';

type HomeProductShowcaseSectionProps = {
  showcase: ProductShowcase;
  onProductPress: (product: ShowcaseProduct) => void;
  onAddToCartPress: (product: ShowcaseProduct) => void;
  /** Vitrin bağlantısını açar: başlıktaki CTA ve kartların dışındaki vitrin zemini aynı yere gider. */
  onShowcasePress: () => void;
};

const SECTION_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.05)';
const SECTION_PADDING = 16;

/**
 * Kart rafı dokunuşu kendisi sahiplenir (web `data-product-showcase-controls`): kartların arasındaki
 * boşluğa dokunmak vitrin bağlantısını açmaz. Kartlar, favori ve "Sepete Ekle" daha derinde
 * oldukları için kendi aksiyonlarını yine önce alır; yatay kaydırma da yerel olarak sürer.
 */
const claimProductRailTouch = () => true;

type ShowcaseHeaderProps = Pick<ProductShowcase, 'title' | 'subtitle' | 'ctaLabel'> & {
  /** Vitrinin bağlantısı yoksa `undefined`; o zaman başlık da CTA da dokunulamaz. */
  onLinkPress?: () => void;
};

/** Vitrin başlığı, alt başlığı ve (bağlantı + etiket varsa) "Tümünü Gör" CTA'sı. */
function ShowcaseHeader({ title, subtitle, ctaLabel, onLinkPress }: ShowcaseHeaderProps) {
  const hasCta = Boolean(ctaLabel && onLinkPress);
  // Etiketsiz bağlantıda ekran okuyucunun vitrine ulaşacağı tek yol başlık olur; CTA varken
  // aynı hedef iki kez duyurulmasın diye başlık düz metin kalır.
  const isTitleLink = Boolean(onLinkPress && !hasCta);

  return (
    <XStack alignItems="center" gap="$2" justifyContent="space-between" marginBottom={12} paddingHorizontal={SECTION_PADDING}>
      <YStack
        accessibilityLabel={isTitleLink ? title || subtitle : undefined}
        accessibilityRole={isTitleLink ? 'link' : undefined}
        accessible={isTitleLink || undefined}
        flex={1}
        onPress={isTitleLink ? onLinkPress : undefined}
      >
        {title ? (
          <Paragraph accessibilityRole="header" color="$color" fontSize={16} fontWeight="800" numberOfLines={1}>
            {title}
          </Paragraph>
        ) : null}
        {subtitle ? (
          <Paragraph color="$color10" fontSize={12} fontWeight="500" marginTop={2} numberOfLines={2}>
            {subtitle}
          </Paragraph>
        ) : null}
      </YStack>
      {hasCta ? (
        <Pressable accessibilityLabel={`${title || 'Vitrin'}: ${ctaLabel}`} accessibilityRole="link" hitSlop={8} onPress={onLinkPress}>
          {({ pressed }) => (
            <XStack alignItems="center" gap={2} opacity={pressed ? 0.7 : 1}>
              <Paragraph color="$brand" fontSize={12} fontWeight="700">
                {ctaLabel}
              </Paragraph>
              <ChevronRight color="$brand" size={14} />
            </XStack>
          )}
        </Pressable>
      ) : null}
    </XStack>
  );
}

/**
 * Ana sayfa ürün vitrini ("Öne Çıkanlar", "Yeni Gelenler"): başlık ve yatay kaydırılan kartlar.
 * Bağlantısı olan vitrinin tamamı dokunulabilir (web `MobileProductShowcase` ile aynı): başlığa ya da
 * vitrin zeminine dokunmak bağlantıyı açar; kartlar, favori ve "Sepete Ekle" kendi aksiyonlarını korur.
 */
export function HomeProductShowcaseSection({
  showcase,
  onProductPress,
  onAddToCartPress,
  onShowcasePress,
}: HomeProductShowcaseSectionProps) {
  const { title, subtitle, ctaLabel, ctaLink, products } = showcase;
  if (products.length === 0) return null;

  const hasLink = Boolean(ctaLink);
  const hasHeader = Boolean(title || subtitle || (ctaLabel && hasLink));
  const onLinkPress = hasLink ? onShowcasePress : undefined;

  return (
    // Zemin dokunuşu ekran okuyucuya ayrı bir öğe olarak sunulmaz (`accessible={false}`): aksi halde
    // kartlar tek bir öğede birleşirdi. Erişilebilir giriş noktası başlıktaki bağlantıdır.
    <Pressable accessible={false} disabled={!hasLink} onPress={onShowcasePress} testID="home-product-showcase-link-area">
      <YStack
        backgroundColor="$background"
        borderRadius={16}
        boxShadow={SECTION_SHADOW}
        overflow="hidden"
        paddingVertical={SECTION_PADDING}
        testID="home-product-showcase"
        width="100%"
      >
        {hasHeader ? <ShowcaseHeader ctaLabel={ctaLabel} onLinkPress={onLinkPress} subtitle={subtitle} title={title} /> : null}

        <YStack onStartShouldSetResponder={claimProductRailTouch} testID="home-product-showcase-rail">
          <ScrollView
            contentContainerStyle={{ gap: 12, paddingBottom: 4, paddingHorizontal: SECTION_PADDING }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {products.map((product, index) => (
              <ShowcaseProductCard
                key={`${getShowcaseProductKey(product)}-${index}`}
                onAddToCartPress={onAddToCartPress}
                onPress={onProductPress}
                product={product}
              />
            ))}
          </ScrollView>
        </YStack>
      </YStack>
    </Pressable>
  );
}
