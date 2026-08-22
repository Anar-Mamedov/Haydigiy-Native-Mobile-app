import { Redirect } from 'expo-router';
import { Spinner, YStack, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Pressable } from 'react-native';
import { ThumbsUp } from '@/components/ui/icons';
import { AppScreen, DeferredMount, EmptyState, PullToDismissScrollView } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { SizeSelectionSheet } from '../components/size-selection-sheet';
import { BundleSelectionSheet } from '../components/bundle-selection-sheet';
import { BundleItemsPreview } from '../components/bundle-items-preview';
import { useProductDetailController } from '../hooks/use-product-detail-controller';
import { ProductCodeBadge } from '../components/product-code-badge';
import { PRODUCT_CODE_BADGE_OFFSET } from '../utils/product-code-badge';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { isMissingResourceApiError } from '@/utils/api-error';

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
import { ProductImageGalleryModal } from '../components/product-image-gallery-modal';
import { NotifyStockDialog } from '../components/notify-stock-dialog';
import {
  SizeChartModal,
  SizeCalculatorModal,
  WashingInstructionsModal,
  FeedbackModal,
} from '../components/product-detail-modals';

/**
 * Ürün detay ekranı — yalnızca sunum yapar.
 * Sorgular, seçim durumu, modal durumları ve sepete ekleme mantığı
 * `useProductDetailController` içindedir.
 */
export function ProductDetailScreen() {
  const controller = useProductDetailController();
  const { bundle, displayData, product, selectedVariant } = controller;

  if (controller.isPending && !controller.previewProduct) {
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

  if (isMissingResourceApiError(controller.error)) {
    return <Redirect href={NOT_FOUND_ROUTE} />;
  }

  if (controller.isError) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <ProductDetailHeader />
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Ürün bilgileri yüklenirken hata oluştu."
          onActionPress={() => controller.refetch()}
          title="Ürün Yüklenemedi"
        />
      </AppScreen>
    );
  }

  if (!displayData) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <ProductDetailHeader />
        <EmptyState description="Seçilen ürün bulunamadı." title="Ürün Bulunamadı" />
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable={false} padding={0} gap={0}>
      <YStack onLayout={(e) => controller.setHeaderHeight(e.nativeEvent.layout.height)}>
        <ProductDetailHeader />
      </YStack>

      <PullToDismissScrollView
        onDismiss={controller.handlePullDismiss}
        onScrollOffsetChange={controller.handleProductScrollOffset}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: controller.contentBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <YStack>
          {/* Images / Carousel */}
          <ProductCarousel
            images={controller.productImages}
            initialIndex={controller.initialImageIndex}
            isFavorite={controller.isFavorite}
            onImagePress={controller.setGalleryImageIndex}
            onToggleFavorite={controller.toggleFavorite}
            onVideoPress={() => controller.setShowVideoModal(true)}
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
            onReviewsPress={controller.openReviews}
            onQuestionsPress={controller.openQuestions}
          />

          {/* Delivery shipment box — driven by the /shipping-estimate API */}
          <YStack marginHorizontal="$4" marginVertical="$2">
            <ShippingEstimateInfo estimate={controller.shippingEstimate} variant="product" />
          </YStack>

          {controller.areProductOptionsLoading ? (
            <ProductSizeSelector
              isLoading
              selectedVariant={selectedVariant}
              onSelectVariant={controller.setSelectedVariant}
              onSizeChartPress={() => controller.setShowSizeChart(true)}
              onSizeCalculatorPress={() => controller.setShowSizeCalculator(true)}
            />
          ) : null}

          {/* Variant selections (only show when fully loaded). Mounted through
              DeferredMount so this heavy subtree does not commit in the same
              frame as the preview→full data swap while the push transition may
              still be running. */}
          {product && (
            <DeferredMount
              placeholder={
                <ProductSizeSelector
                  isLoading
                  selectedVariant={selectedVariant}
                  onSelectVariant={controller.setSelectedVariant}
                  onSizeChartPress={() => controller.setShowSizeChart(true)}
                  onSizeCalculatorPress={() => controller.setShowSizeCalculator(true)}
                />
              }
            >
              {/* Color variants thumbnails & Category redirect */}
              <ProductColorSelector
                otherColors={product.otherColors}
                currentProductId={product.id}
                currentProductSlug={product.slug}
                currentProductImage={product.imageUrl}
                onColorSelect={controller.handleColorSelect}
                categoryName={product.category}
                categorySlug={product.categorySlug}
                categoryId={product.categoryId}
                onCategoryPress={controller.handleCategoryPress}
              />

              {/* Bundle: tek beden seçici yerine paket özeti; seçim alt sayfada yapılır */}
              {bundle.isBundle && bundle.summary ? (
                <BundleItemsPreview
                  items={bundle.items}
                  onPress={bundle.openSheet}
                  selectedCount={bundle.selection.selectedCount}
                  summary={bundle.summary}
                />
              ) : (
                /* Size selector squares */
                <ProductSizeSelector
                  variants={product.variants}
                  featureIcons={product.featureIcons}
                  selectedVariant={selectedVariant}
                  onSelectVariant={controller.setSelectedVariant}
                  onSizeChartPress={() => controller.setShowSizeChart(true)}
                  onSizeCalculatorPress={() => controller.setShowSizeCalculator(true)}
                />
              )}

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
                onProductPress={controller.handleSimilarProductPress}
              />

              {/* Reviews score and horizontal list */}
              <ProductReviewsSection
                reviews={product.reviews}
                averageRating={product.rating}
                onReviewsPress={controller.openReviews}
              />

              {/* Questions list */}
              <ProductQuestionsSection
                questions={product.questions}
                onQuestionsPress={controller.openQuestions}
              />

              {/* Product description & specifications table & washing instructions */}
              <MobileProductInformation
                productData={{
                  description: product.description,
                  imageUrl: product.imageUrl,
                }}
                properties={product.properties}
                sizeMeasurements={product.sizeMeasurements}
                onWashingInstructionsPress={() => controller.setShowWashing(true)}
              />

              {/* Feedback Button */}
              <Pressable
                onPress={() => controller.setShowFeedback(true)}
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
            </DeferredMount>
          )}
        </YStack>
      </PullToDismissScrollView>

      {/* Sticky footer price & CTA buttons */}
      <ProductStickyFooter
        price={displayData.price}
        originalPrice={displayData.originalPrice}
        onAddToCart={controller.handleAddToCart}
        onNotifyMe={controller.handleNotifyMe}
        onWhatsappPress={controller.handleWhatsappPress}
        isApprovedForSale={displayData.isApprovedForSale}
        isAuthenticated={controller.isAuthenticated}
        isLastOne={selectedVariant?.quantity === 1}
        isNotified={controller.isVariantNotified(selectedVariant?.id)}
        isNotifying={controller.isNotifying}
        isOutOfStock={controller.isSelectedVariantOutOfStock}
      />

      <NotifyStockDialog
        onOpenChange={controller.closeNotifyConfirmation}
        open={controller.isNotifyConfirmationOpen}
      />

      {/* Bundle beden seçim alt sayfası — paket kalemi başına beden seçilir */}
      {bundle.isBundle && bundle.summary ? (
        <BundleSelectionSheet
          errorMessage={bundle.errorMessage}
          imageUrl={displayData.imageUrl}
          isAdding={bundle.isAdding}
          isComplete={bundle.selection.isComplete}
          isPurchasable={bundle.selection.isPurchasable}
          items={bundle.items}
          missingHighlight={bundle.selection.missingHighlight}
          missingItemIds={bundle.selection.missingItemIds}
          onClose={bundle.closeSheet}
          onConfirm={bundle.confirmAdd}
          onSelectVariant={bundle.selection.selectVariant}
          open={bundle.isSheetOpen}
          productName={displayData.title}
          selectedCount={bundle.selection.selectedCount}
          selections={bundle.selection.selections}
          shippingMessage={controller.shippingMessage}
          summary={bundle.summary}
        />
      ) : null}

      {/* Size selection bottom sheet (opened from "Sepete Ekle" when no size chosen) */}
      {controller.showSizeSheet ? (
        <SizeSelectionSheet
          featureIcons={product?.featureIcons}
          imageUrl={displayData.imageUrl}
          isApprovedForSale={displayData.isApprovedForSale}
          isAuthenticated={controller.isAuthenticated}
          isLoadingVariants={controller.areProductOptionsLoading}
          isNotified={controller.isVariantNotified(selectedVariant?.id)}
          isNotifying={controller.isNotifying}
          onNotifyMe={controller.handleNotifyMe}
          onAskQuestion={controller.openQuestions}
          onClose={() => controller.setShowSizeSheet(false)}
          onConfirm={controller.confirmAddToCart}
          onSelectVariant={controller.setSelectedVariant}
          open
          priceLabel={formatCurrency(displayData.price)}
          productName={displayData.title}
          selectedVariant={selectedVariant}
          shippingMessage={controller.shippingMessage}
          variants={product?.variants ?? []}
        />
      ) : null}

      {/* Auxiliary Modals */}
      <SizeChartModal open={controller.showSizeChart} onOpenChange={controller.setShowSizeChart} />
      <SizeCalculatorModal
        open={controller.showSizeCalculator}
        onOpenChange={controller.setShowSizeCalculator}
        onCalculateComplete={controller.applyCalculatedSize}
      />
      <WashingInstructionsModal
        open={controller.showWashing}
        onOpenChange={controller.setShowWashing}
      />
      <FeedbackModal
        open={controller.showFeedback}
        onOpenChange={controller.setShowFeedback}
        productId={displayData.id}
        productSlug={displayData.slug}
      />
      <ProductImageGalleryModal
        images={controller.productImages}
        initialIndex={controller.galleryImageIndex ?? 0}
        onClose={() => controller.setGalleryImageIndex(null)}
        open={controller.galleryImageIndex !== null}
      />
      {displayData.videoPath ? (
        <ProductVideoModal
          onOpenChange={controller.setShowVideoModal}
          open={controller.showVideoModal}
          videoUri={displayData.videoPath}
          product={displayData}
          onPrimaryCta={() => {
            controller.setShowVideoModal(false);
            controller.handleAddToCart();
          }}
        />
      ) : null}

      {/* Product code badge pinned under the header while the carousel is visible */}
      {controller.showProductCode && controller.productCode ? (
        <ProductCodeBadge
          code={controller.productCode}
          top={controller.headerHeight + PRODUCT_CODE_BADGE_OFFSET}
        />
      ) : null}
    </AppScreen>
  );
}
