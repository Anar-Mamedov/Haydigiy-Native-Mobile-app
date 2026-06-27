import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Spinner, YStack, Paragraph, XStack } from 'tamagui';
import { Linking, Pressable } from 'react-native';
import { ThumbsUp } from '@tamagui/lucide-icons-2';
import { AppScreen, EmptyState } from '@/components/ui';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { useGoToCartAfterAdd } from '@/features/cart/hooks/use-go-to-cart-after-add';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { formatCurrency } from '@/utils/format-currency';
import { SizeSelectionSheet } from '../components/size-selection-sheet';
import { trackViewedProduct } from '@/utils/recently-viewed';
import { useToggleFavorite } from '@/features/favorite/api/favorite.queries';
import { ProductVariant, Product } from '@/types/product.types';

// Subcomponents
import { ProductDetailHeader } from '../components/product-detail-header';
import { ProductCarousel } from '../components/product-carousel';
import { ProductInfo } from '../components/product-info';
import { ShippingEstimateInfo } from '@/features/shipping/components/shipping-estimate-info';
import { ProductColorSelector } from '../components/product-color-selector';
import { ProductSizeSelector } from '../components/product-size-selector';
import { ProductSpecifications } from '../components/product-specifications';
import { SimilarProductsSection } from '../components/similar-products-section';
import { ProductReviewsSection } from '../components/product-reviews-section';
import { ProductQuestionsSection } from '../components/product-questions-section';
import { ProductStickyFooter } from '../components/product-sticky-footer';
import { MobileProductInformation } from '../components/mobile-product-information';
import { ProductVideoModal } from '../components/product-video-modal';
import {
  SizeChartModal,
  SizeCalculatorModal,
  WashingInstructionsModal,
  FeedbackModal,
} from '../components/product-detail-modals';

export function ProductDetailScreen() {
  const router = useRouter();
  
  // Read params for immediate rendering preview
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    price?: string;
    imageUrl?: string;
    brand?: string;
    sellerName?: string;
    shippingLabel?: string;
  }>();

  const idOrSlug = params.id ?? '';
  
  // Queries
  const { data: product, isError, isPending, refetch } = useProductDetailsQuery(idOrSlug);
  const addToCart = useAddToCartMutation();
  const goToCartAfterAdd = useGoToCartAfterAdd();
  const shippingQuery = useShippingEstimateQuery();

  // States
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Tapping the "Değerlendirme" / "Soru & Cevap" links opens dedicated screens
  // (mirrors the web /yorum and /soru pages).
  const reviewSlug = product?.slug ?? params.id ?? '';
  const openReviews = () =>
    router.push({ pathname: '/(tabs)/product-reviews', params: { slug: reviewSlug } });
  const openQuestions = () =>
    router.push({ pathname: '/(tabs)/product-questions', params: { slug: reviewSlug } });

  // Modal states
  const [showSizeSheet, setShowSizeSheet] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Close the size sheet whenever the screen loses focus (e.g. navigating to the
  // Q&A page from inside it) so it never lingers when the user returns.
  useFocusEffect(useCallback(() => () => setShowSizeSheet(false), []));
  const [showSizeCalculator, setShowSizeCalculator] = useState(false);
  const [showWashing, setShowWashing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Recently Viewed Tracking
  useEffect(() => {
    if (product) {
      trackViewedProduct({
        id: product.id,
        name: product.title,
        slug: product.slug,
        thumb: product.imageUrl,
        price: String(product.price),
      });
    }
  }, [product]);

  useEffect(() => {
    setShowVideoModal(false);
  }, [idOrSlug]);

  // Handle color change
  const handleColorSelect = (slug: string) => {
    router.replace(`/product/${slug}` as any);
  };

  // Handle whatsapp action
  const handleWhatsappPress = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    const message = `${activeProduct.title} - ${activeProduct.stockCode || ''} ürününe bakıyorum, destek istiyorum.\nhttps://haydigiy.com/product/${activeProduct.slug}`;
    const url = `whatsapp://send?phone=905327805100&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/905327805100?text=${encodeURIComponent(message)}`);
      }
    });
  };

  // Handle add to cart action
  const handleAddToCart = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    const hasVariants = activeProduct.variants && activeProduct.variants.length > 0;

    // No size chosen yet: open the size-selection bottom sheet (mirrors the web).
    if (hasVariants && !selectedVariant) {
      setShowSizeSheet(true);
      return;
    }

    confirmAddToCart();
  };

  // Adds the selected variant to the cart; shared by the sticky footer button and
  // the size-selection sheet's confirm. The cart count query refreshes the tab
  // badge via invalidation and the cart screen re-fetches the authoritative list.
  const confirmAddToCart = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    const variantId = selectedVariant?.pivotId ?? selectedVariant?.id;
    if (variantId) {
      addToCart.mutate({ variantId });
    }
    setShowSizeSheet(false);
    // Skip the success modal and take the user straight to the cart.
    goToCartAfterAdd();
  };

  // Build preview product if query is still loading but params exist
  const previewProduct: Product | null = params.title
    ? {
        id: idOrSlug,
        title: params.title,
        price: parseFloat(params.price || '0'),
        imageUrl: params.imageUrl || '',
        brand: params.brand || 'HaydiGiy',
        sellerName: params.sellerName || 'HaydiGiy',
        shippingLabel: params.shippingLabel || '',
        slug: idOrSlug,
        currency: 'TRY' as const,
        description: '',
        rating: 0,
        reviewCount: 0,
        category: 'Giyim',
      }
    : null;

  const displayData = product || previewProduct;
  const { isFavorite, toggleFavorite } = useToggleFavorite(displayData);

  if (isPending && !previewProduct) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <ProductDetailHeader />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Spinner size="large" color="$brand" />
          <Paragraph color="$color10">Ürün detayları yükleniyor...</Paragraph>
        </YStack>
      </AppScreen>
    );
  }

  if (isError) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <ProductDetailHeader />
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Ürün bilgileri yüklenirken hata oluştu."
          onActionPress={() => refetch()}
          title="Ürün Yüklenemedi"
        />
      </AppScreen>
    );
  }

  if (!displayData) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <ProductDetailHeader />
        <EmptyState
          description="Seçilen ürün bulunamadı."
          title="Ürün Bulunamadı"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable={false} padding={0} gap={0}>
      <ProductDetailHeader />

      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Images / Carousel */}
          <ProductCarousel
            images={displayData.images || [displayData.imageUrl]}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onVideoPress={() => setShowVideoModal(true)}
            stockCode={displayData.stockCode}
            videoPath={displayData.videoPath}
            productTitle={displayData.title}
            productSlug={displayData.slug}
            featureIcons={product?.featureIcons}
          />

          {/* Product Primary Info */}
          <ProductInfo
            brand={displayData.brand}
            title={displayData.title}
            rating={displayData.rating}
            reviewCount={displayData.reviewCount}
            questionsCount={displayData.questionsCount ?? displayData.questions?.length ?? 0}
            favoritesCount={displayData.favoritesCount}
            cartCount={displayData.cartCount}
            totalQuantity={displayData.totalQuantity}
            onReviewsPress={openReviews}
            onQuestionsPress={openQuestions}
          />

          {/* Delivery shipment box — driven by the /shipping-estimate API */}
          <YStack marginHorizontal="$4" marginVertical="$2">
            <ShippingEstimateInfo estimate={shippingQuery.data} variant="product" />
          </YStack>

          {/* Background Loading Spinner for full properties */}
          {isPending && (
            <XStack alignItems="center" gap="$2" justifyContent="center" padding="$4">
              <Spinner size="small" color="$brand" />
              <Paragraph fontSize={12} color="$color10">Seçenekler yükleniyor...</Paragraph>
            </XStack>
          )}

          {/* Variant selections (only show when fully loaded) */}
          {product && (
            <>
              {/* Color variants thumbnails & Category redirect */}
              <ProductColorSelector
                otherColors={product.otherColors}
                currentProductId={product.id}
                currentProductSlug={product.slug}
                currentProductImage={product.imageUrl}
                onColorSelect={handleColorSelect}
                categoryName={product.category}
                categorySlug={product.categorySlug}
                categoryId={product.categoryId}
                onCategoryPress={(slug, id) => {
                  router.push({
                    pathname: `/kategori/${slug}`,
                    params: { c: String(id || '') }
                  } as any);
                }}
              />

              {/* Size selector squares */}
              <ProductSizeSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => setSelectedVariant(v)}
                onSizeChartPress={() => setShowSizeChart(true)}
                onSizeCalculatorPress={() => setShowSizeCalculator(true)}
              />

              {/* Specifications highlights & mannequin details */}
              <ProductSpecifications
                properties={product.properties}
                model={product.model}
                variantOnModel={product.variantOnModel}
                categoryName={product.category}
              />

              {/* Similar Products widget */}
              <SimilarProductsSection
                products={product.similarProducts}
                onProductPress={handleColorSelect}
              />

              {/* Reviews score and horizontal list */}
              <ProductReviewsSection
                reviews={product.reviews}
                averageRating={product.rating}
                onReviewsPress={openReviews}
              />

              {/* Questions list */}
              <ProductQuestionsSection
                questions={product.questions}
                onQuestionsPress={openQuestions}
              />

              {/* Product description & specifications table & washing instructions */}
              <MobileProductInformation
                productData={{
                  description: product.description,
                  imageUrl: product.imageUrl,
                }}
                properties={product.properties}
                onWashingInstructionsPress={() => setShowWashing(true)}
              />

              {/* Feedback Button */}
              <Pressable
                onPress={() => setShowFeedback(true)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  marginHorizontal: 16,
                  marginVertical: 12,
                })}
              >
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  borderColor="$borderColor"
                  borderWidth={2}
                  backgroundColor="$background"
                  borderRadius={8}
                  paddingHorizontal={12}
                  paddingVertical={10}
                  gap={8}
                >
                  <ThumbsUp size={16} color="$brand" />
                  <Paragraph fontSize={13} fontWeight="700" color="$color">
                    Geri Bildirim Ver
                  </Paragraph>
                </XStack>
              </Pressable>
            </>
          )}
        </YStack>
      </ScrollView>

      {/* Sticky footer price & CTA buttons */}
      <ProductStickyFooter
        price={displayData.price}
        originalPrice={displayData.originalPrice}
        onAddToCart={handleAddToCart}
        onWhatsappPress={handleWhatsappPress}
        isApprovedForSale={displayData.isApprovedForSale}
        isLastOne={selectedVariant?.quantity === 1}
      />

      {/* Size selection bottom sheet (opened from "Sepete Ekle" when no size chosen) */}
      {showSizeSheet ? (
        <SizeSelectionSheet
          imageUrl={displayData.imageUrl}
          onAskQuestion={openQuestions}
          onClose={() => setShowSizeSheet(false)}
          onConfirm={confirmAddToCart}
          onSelectVariant={(variant) => setSelectedVariant(variant)}
          open
          priceLabel={formatCurrency(displayData.price)}
          productName={displayData.title}
          selectedVariant={selectedVariant}
          shippingMessage={shippingQuery.data?.message}
          variants={product?.variants ?? []}
        />
      ) : null}

      {/* Auxiliary Modals */}
      <SizeChartModal open={showSizeChart} onOpenChange={setShowSizeChart} />
      <SizeCalculatorModal
        open={showSizeCalculator}
        onOpenChange={setShowSizeCalculator}
        onCalculateComplete={(sizeName) => {
          // Pre-select the matching size in the background, but keep the sheet
          // open so the user can see the recommended size result.
          if (product?.variants) {
            const matched = product.variants.find(
              (v) => v.name.toLowerCase() === sizeName.toLowerCase()
            );
            if (matched) setSelectedVariant(matched);
          }
        }}
      />
      <WashingInstructionsModal open={showWashing} onOpenChange={setShowWashing} />
      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
        productId={displayData.id}
        productSlug={displayData.slug}
      />
      {displayData.videoPath ? (
        <ProductVideoModal
          onOpenChange={setShowVideoModal}
          open={showVideoModal}
          videoUri={displayData.videoPath}
          product={displayData}
          onPrimaryCta={() => {
            setShowVideoModal(false);
            handleAddToCart();
          }}
        />
      ) : null}
    </AppScreen>
  );
}
