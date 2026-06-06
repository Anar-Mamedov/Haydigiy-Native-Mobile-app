import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Spinner, YStack, Paragraph, XStack, useThemeName } from 'tamagui';
import { Alert, Linking, Pressable } from 'react-native';
import { ThumbsUp } from '@tamagui/lucide-icons-2';
import { AppScreen, EmptyState } from '@/components/ui';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';
import { trackViewedProduct } from '@/utils/recently-viewed';
import { useToggleFavorite } from '@/features/favorite/api/favorite.queries';
import { ProductVariant, Product } from '@/types/product.types';

// Subcomponents
import { ProductDetailHeader } from '../components/product-detail-header';
import { ProductCarousel } from '../components/product-carousel';
import { ProductInfo } from '../components/product-info';
import { ProductDeliveryInfo } from '../components/product-delivery-info';
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
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');
  
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
  const addItem = useCartStore((state) => state.addItem);

  // States
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Modal states
  const [showSizeChart, setShowSizeChart] = useState(false);
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
    
    if (hasVariants && !selectedVariant) {
      Alert.alert(
        'Beden Seçin',
        'Lütfen ürünü sepetinize eklemeden önce bir beden seçimi yapınız.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    addItem(activeProduct, selectedVariant?.name);
    Alert.alert(
      'Başarılı',
      `${activeProduct.title}${selectedVariant ? ` (${selectedVariant.name})` : ''} sepetinize eklendi.`,
      [
        { text: 'Alışverişe Devam Et', style: 'cancel' },
        { text: 'Sepete Git', onPress: () => router.push('/(tabs)/cart') }
      ]
    );
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
            questionsCount={displayData.questions?.length ?? 0}
            favoritesCount={displayData.favoritesCount}
            cartCount={displayData.cartCount}
            totalQuantity={displayData.totalQuantity}
            onReviewsPress={() => {}}
            onQuestionsPress={() => {}}
          />

          {/* Delivery shipment boxes */}
          <ProductDeliveryInfo />

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
                onReviewsPress={() => {}}
              />

              {/* Questions list */}
              <ProductQuestionsSection
                questions={product.questions}
                onQuestionsPress={() => {}}
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
                  backgroundColor={isDark ? '#1F2937' : 'white'}
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

      {/* Auxiliary Modals */}
      <SizeChartModal open={showSizeChart} onOpenChange={setShowSizeChart} />
      <SizeCalculatorModal
        open={showSizeCalculator}
        onOpenChange={setShowSizeCalculator}
        onCalculateComplete={(sizeName) => {
          if (product?.variants) {
            const matched = product.variants.find(
              (v) => v.name.toLowerCase() === sizeName.toLowerCase()
            );
            if (matched) setSelectedVariant(matched);
          }
          setShowSizeCalculator(false);
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
