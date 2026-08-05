import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { AppScreen, AppSelect, EmptyState, ScreenHeader, SearchInput } from '@/components/ui';
import { ProductReviewFilters } from '@/services/product.service';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { useGoToCartAfterAdd } from '@/features/cart/hooks/use-go-to-cart-after-add';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { buildInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { ProductVariant } from '@/types/product.types';
import { useProductReviewsQuery } from '../api/product-reviews.queries';
import { ProductReviewItem } from '../api/product-reviews.mapper';
import { SizeSelectionSheet } from '../components/size-selection-sheet';
import { ReviewProductCard } from '../components/review-product-card';
import { ReviewFiltersCard } from '../components/review-filters-card';
import { ReviewPhotoStrip } from '../components/review-photo-strip';
import { ReviewCard } from '../components/review-card';
import { CriteriaSheet } from '../components/criteria-sheet';
import { ReviewPhotoGallery } from '../components/review-photo-gallery';
import { ProductCtaFooter } from '../components/product-cta-footer';

const SORT_OPTIONS = [
  { label: 'En Yüksek Puan', value: 'highest' },
  { label: 'En Düşük Puan', value: 'lowest' },
  { label: 'En Yeni', value: 'newest' },
  { label: 'En Eski', value: 'oldest' },
];

const REVIEW_CRITERIA = [
  'Hukuka, genel ahlaka ve kamu düzenine uygun olmalı',
  'Kişisel verileri ve özel hayatın gizliliğini ihlal etmemeli',
  'Hakaret, küfür, tehdit, taciz veya müstehcenlik barındırmamalı',
  'Satın alınan ürünle doğrudan ilgili olmalı',
  'Yanıltıcı bilgi içermemeli',
  'Sağlık beyanı içermemeli',
];

function countBy(reviews: ProductReviewItem[], key: 'height' | 'weight'): Record<string, number> {
  const counts: Record<string, number> = {};
  reviews.forEach((review) => {
    const value = review[key];
    if (value) counts[String(value)] = (counts[String(value)] ?? 0) + 1;
  });
  return counts;
}

/** Dedicated product reviews page (mirrors the web mobile `/yorum/[slug]`). */
export function ProductReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [star, setStar] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(-1);
  const [size, setSize] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sort, setSort] = useState('highest');
  const [search, setSearch] = useState('');
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showSizeSheet, setShowSizeSheet] = useState(false);

  const addToCart = useAddToCartMutation();
  const goToCartAfterAdd = useGoToCartAfterAdd();
  const shippingQuery = useShippingEstimateQuery();

  useFocusEffect(useCallback(() => () => setShowSizeSheet(false), []));

  const filters: ProductReviewFilters = {
    star: star || undefined,
    has_photo: hasPhoto >= 0 ? hasPhoto : undefined,
    sort,
    size: size || undefined,
    height: height || undefined,
    weight: weight || undefined,
  };
  const query = useProductReviewsQuery(slug, filters);

  const reviews = useMemo(() => query.data?.reviews ?? [], [query.data?.reviews]);
  const photoReviews = useMemo(() => reviews.filter((review) => review.photo), [reviews]);
  const heightCounts = useMemo(() => countBy(reviews, 'height'), [reviews]);
  const weightCounts = useMemo(() => countBy(reviews, 'weight'), [reviews]);
  const visibleReviews = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR');
    if (!term) return reviews;
    return reviews.filter((review) => review.comment.toLocaleLowerCase('tr-TR').includes(term));
  }, [reviews, search]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const goToProduct = () => router.push({ pathname: '/product/[id]', params: { id: slug } });
  const goToQuestions = () =>
    router.push({ pathname: '/(tabs)/product-questions', params: { slug } });

  const handleAddToCartPress = () => {
    const product = query.data?.product;
    if (!product) return;
    if (product.variants.length > 0 && !selectedVariant) {
      setShowSizeSheet(true);
      return;
    }
    confirmAddToCart();
  };

  const confirmAddToCart = () => {
    const product = query.data?.product;
    if (!product) return;
    const variantId = selectedVariant?.pivotId ?? selectedVariant?.id;
    if (variantId) {
      addToCart.mutate({
        variantId,
        tracking: buildInsiderInput({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: selectedVariant?.price || Number(product.price) || 0,
          size: selectedVariant?.name,
          quantity: 1,
          slug,
        }),
      });
    }
    setShowSizeSheet(false);
    // Skip the success modal and take the user straight to the cart.
    goToCartAfterAdd();
  };
  const openGalleryForReview = (review: ProductReviewItem) => {
    const index = photoReviews.findIndex((item) => item.id === review.id);
    setGalleryIndex(index >= 0 ? index : 0);
  };
  const handleGalleryAddToCartPress = () => {
    setGalleryIndex(null);
    handleAddToCartPress();
  };

  const total = query.data?.summary.total ?? 0;
  const title = total > 0 ? `Ürün Değerlendirmeleri (${total})` : 'Ürün Değerlendirmeleri';
  const header = <ScreenHeader onBack={handleBack} title={title} />;

  if (query.isPending) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Değerlendirmeler yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const hasActiveFilter = star > 0 || hasPhoto >= 0 || Boolean(size || height || weight || search.trim());

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <ScrollView contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <ReviewProductCard
          onCriteriaPress={() => setCriteriaOpen(true)}
          onProductPress={goToProduct}
          product={query.data.product}
          summary={query.data.summary}
        />

        <ReviewFiltersCard
          hasPhoto={hasPhoto}
          height={height}
          heightCounts={heightCounts}
          heights={query.data.filterValues.heights}
          onHeightChange={setHeight}
          onPhotoChange={setHasPhoto}
          onSizeChange={setSize}
          onStarChange={setStar}
          onWeightChange={setWeight}
          size={size}
          sizes={query.data.filterValues.sizes}
          star={star}
          weight={weight}
          weightCounts={weightCounts}
          weights={query.data.filterValues.weights}
        />

        <XStack gap="$2">
          <YStack flex={1}>
            <SearchInput
              accessibilityLabel="Değerlendirmelerde ara"
              onChangeText={setSearch}
              placeholder="Değerlendirmelerde Ara"
              value={search}
            />
          </YStack>
          <YStack width={150}>
            <AppSelect
              label="Sıralama"
              onValueChange={(value) => setSort(String(value))}
              options={SORT_OPTIONS}
              value={sort}
            />
          </YStack>
        </XStack>

        <ReviewPhotoStrip onPhotoPress={(index) => setGalleryIndex(index)} photoReviews={photoReviews} />

        {visibleReviews.length === 0 ? (
          <Paragraph color="$color10" fontSize={14} paddingVertical="$6" textAlign="center">
            {hasActiveFilter ? 'Filtrelere uygun değerlendirme bulunamadı.' : 'Değerlendirme bulunamadı.'}
          </Paragraph>
        ) : (
          visibleReviews.map((review) => (
            <ReviewCard key={review.id} onPhotoPress={() => openGalleryForReview(review)} review={review} />
          ))
        )}
      </ScrollView>

      <ProductCtaFooter leftLabel="Soru & Cevap" onLeftPress={goToQuestions} onRightPress={handleAddToCartPress} />

      {showSizeSheet ? (
        <SizeSelectionSheet
          imageUrl={query.data.product.imageUrl}
          onAskQuestion={() => {
            setShowSizeSheet(false);
            goToQuestions();
          }}
          onClose={() => setShowSizeSheet(false)}
          onConfirm={confirmAddToCart}
          onSelectVariant={setSelectedVariant}
          open
          priceLabel={query.data.product.price ? `${query.data.product.price} TL` : ''}
          productName={query.data.product.name}
          selectedVariant={selectedVariant}
          shippingMessage={shippingQuery.data?.message}
          variants={query.data.product.variants}
        />
      ) : null}

      <CriteriaSheet
        criteria={REVIEW_CRITERIA}
        intro="Ürün Değerlendirmeleri, müşterilerimizin HaydiGiy üzerinden satın aldıkları ürünlere yönelik deneyimlerini paylaşabilecekleri önemli bir araçtır."
        onClose={() => setCriteriaOpen(false)}
        open={criteriaOpen}
        title="Yorum Yayınlama Kriterleri"
      />
      {galleryIndex !== null ? (
        <ReviewPhotoGallery
          initialIndex={galleryIndex}
          onAddToCartPress={handleGalleryAddToCartPress}
          onClose={() => setGalleryIndex(null)}
          open
          photos={photoReviews}
          product={query.data.product}
        />
      ) : null}
    </AppScreen>
  );
}
