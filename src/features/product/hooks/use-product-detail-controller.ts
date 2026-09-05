import { useCallback, useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { useGoToCartAfterAdd } from '@/features/cart/hooks/use-go-to-cart-after-add';
import { useToggleFavorite } from '@/features/favorite/api/favorite.queries';
import { useTrackProductDetailView } from '@/features/insider/hooks/use-insider-page-tracking';
import { productToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { useProductDetailsQuery } from '@/features/product/api/product.queries';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { Product, ProductColorOption, ProductVariant, SimilarProduct } from '@/types/product.types';
import { getApiErrorMessage } from '@/utils/api-error';
import { trackViewedProduct } from '@/utils/recently-viewed';
import { openWhatsapp } from '@/utils/whatsapp';
import { PRODUCT_STICKY_FOOTER_SCROLL_PADDING } from '../components/product-sticky-footer';
import { extractProductCode } from '../utils/extract-product-code';
import { getCarouselImageHeight } from '../utils/product-carousel-geometry';
import { isProductCodeBadgeVisible } from '../utils/product-code-badge';
import { buildProductDetailRoute } from '../utils/product-detail-route';
import { useBundleController } from './use-bundle-controller';
import { useNotifyStock } from './use-notify-stock';

const ADD_TO_CART_ERROR = 'Ürün sepete eklenemedi. Lütfen tekrar deneyin.';
const MISSING_VARIANT_ERROR = 'Bu ürün için beden bilgisi bulunamadı, sepete eklenemedi.';

/**
 * Ürün detay ekranının tüm iş mantığı: sorgular, beden/paket seçimi, modal durumları,
 * yönlendirmeler, analitik olayları ve sepete ekleme.
 *
 * Ekran yalnızca sunum yapar; durum ve yan etkiler burada durur (sepet ve iptal
 * ekranlarındaki `use*Controller` kalıbının aynısı).
 */
export function useProductDetailController() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Liste kartından gelen önizleme parametreleri: detay isteği dönene kadar ekran
  // boş beklemesin diye kullanılır.
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    price?: string;
    imageUrl?: string;
    brand?: string;
    sellerName?: string;
    shippingLabel?: string;
    imageIndex?: string;
  }>();

  const idOrSlug = params.id ?? '';
  // Image index the list card was showing, so the carousel opens on the same one.
  const initialImageIndex = params.imageIndex ? Math.max(0, parseInt(params.imageIndex, 10) || 0) : 0;

  // Queries
  const { data: product, error, isError, isPending, refetch } = useProductDetailsQuery(idOrSlug);
  const addToCart = useAddToCartMutation();
  const goToCartAfterAdd = useGoToCartAfterAdd();
  const shippingQuery = useShippingEstimateQuery();

  // Bundle (paket) ürün: normal beden seçimi yerine paket kalemi başına seçim yapılır.
  const bundle = useBundleController(product, { onAdded: goToCartAfterAdd });

  // States
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const {
    closeConfirmation: closeNotifyConfirmation,
    errorMessage: notifyErrorMessage,
    isConfirmationOpen: isNotifyConfirmationOpen,
    isNotifying,
    isVariantNotified,
    requestNotification,
  } = useNotifyStock();

  // Pinned product-code badge: stays fixed under the header while the product
  // image is on screen, then disappears the moment the image scrolls off the
  // top (mirrors the web `isCarouselVisible` behaviour). The image height is
  // derived from the screen width (same formula as the carousel) so it does not
  // depend on an onLayout pass that may not fire. Visibility is only flipped
  // when it actually changes, so scrolling does not re-render per frame.
  const { width: windowWidth } = useWindowDimensions();
  const carouselImageHeight = getCarouselImageHeight(windowWidth);
  const [showProductCode, setShowProductCode] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(56);

  const handleProductScrollOffset = (offsetY: number) => {
    const visible = isProductCodeBadgeVisible(carouselImageHeight, offsetY);
    setShowProductCode((prev) => (prev === visible ? prev : visible));
  };

  // Pulling the content down while it rests at the top closes the screen
  // (falls back to home when the PDP was opened directly, e.g. via deep link).
  const handlePullDismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

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
  const [galleryImageIndex, setGalleryImageIndex] = useState<number | null>(null);

  // Insider "ürün detay görüntüleme" (fires once per loaded product).
  useTrackProductDetailView(product);

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
    setGalleryImageIndex(null);
  }, [idOrSlug]);

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
  const areProductOptionsLoading = isPending && !product;

  // Color variants and similar products replace the current PDP (so back still
  // returns to the origin list) with preview params, so the target renders
  // instantly instead of showing a spinner until its detail request lands.
  const replaceWithPreview = (target: Pick<Product, 'id' | 'slug' | 'title' | 'price' | 'imageUrl'>) => {
    router.replace(buildProductDetailRoute(target));
  };

  const handleColorSelect = (color: ProductColorOption) => {
    replaceWithPreview({
      id: color.id,
      slug: color.slug,
      title: color.name,
      // Sibling colors of the same model share the price when the option
      // itself does not carry one.
      price: color.price || displayData?.price || 0,
      imageUrl: color.imageUrl,
    });
  };

  /** Renk seçicinin altındaki kategori kısayolu. */
  const handleCategoryPress = (slug: string, id?: number | string) => {
    router.push({ pathname: `/kategori/${slug}`, params: { c: String(id || '') } } as never);
  };

  const handleSimilarProductPress = (similar: SimilarProduct) => {
    replaceWithPreview({
      id: similar.id,
      slug: similar.slug,
      title: similar.name,
      price: similar.price,
      imageUrl: similar.imageUrl,
    });
  };

  // Handle whatsapp action
  const handleWhatsappPress = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    const message = `${activeProduct.title} - ${activeProduct.stockCode || ''} ürününe bakıyorum, destek istiyorum.\nhttps://haydigiy.com/product/${activeProduct.slug}`;

    void openWhatsapp(message);
  };

  // Handle add to cart action
  // Seçili beden tükendiyse birincil aksiyon sepete eklemek yerine stok
  // bildirimi talebine dönüşür (web ile aynı davranış).
  const isSelectedVariantOutOfStock = Boolean(
    selectedVariant && (!selectedVariant.hasStock || selectedVariant.quantity < 1),
  );

  const handleNotifyMe = () => {
    // Hata da başarı da hook'un dialogunda gösteriliyor; burada yutulacak bir şey yok.
    void requestNotification(selectedVariant?.id);
  };

  // Adds the selected variant to the cart; shared by the sticky footer button and
  // the size-selection sheet's confirm. The cart count query refreshes the tab
  // badge via invalidation and the cart screen re-fetches the authoritative list.
  const confirmAddToCart = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    const variantId = selectedVariant?.pivotId ?? selectedVariant?.id;
    // Beden çözülemiyorsa istek gönderilemez; kullanıcı hiçbir şey eklenmeden
    // sessizce sepete yönlendirilmez.
    if (!variantId) {
      Alert.alert('Hata', MISSING_VARIANT_ERROR);
      return;
    }

    addToCart.mutate(
      {
        variantId,
        tracking: productToInsiderInput(activeProduct, {
          size: selectedVariant?.name,
          quantity: 1,
        }),
      },
      {
        // Hata sessizce yutulmaz; kullanıcı nedenini görür.
        onError: (error) => Alert.alert('Hata', getApiErrorMessage(error, ADD_TO_CART_ERROR)),
      },
    );
    setShowSizeSheet(false);
    // Skip the success modal and take the user straight to the cart.
    goToCartAfterAdd();
  };

  const handleAddToCart = () => {
    const activeProduct = product || previewProduct;
    if (!activeProduct) return;

    // Bundle'da tek varyant yoktur; beden seçimi paket kalemi başına alt sayfada yapılır.
    if (bundle.isBundle) {
      bundle.openSheet();
      return;
    }

    if (isPending && !product) {
      setShowSizeSheet(true);
      return;
    }

    const hasVariants = activeProduct.variants && activeProduct.variants.length > 0;

    // No size chosen yet: open the size-selection bottom sheet (mirrors the web).
    if (hasVariants && !selectedVariant) {
      setShowSizeSheet(true);
      return;
    }

    confirmAddToCart();
  };

  /**
   * Beden hesaplayıcının önerdiği bedeni arka planda seçer; alt sayfa açık kalır ki
   * kullanıcı önerilen sonucu görebilsin.
   */
  const applyCalculatedSize = (sizeName: string) => {
    if (product?.isApprovedForSale === false) return;

    const matched = product?.variants?.find(
      (variant) => variant.name.toLowerCase() === sizeName.toLowerCase(),
    );
    if (matched) setSelectedVariant(matched);
  };

  // Taşıyıcı için görsel listesi: detay görselleri yoksa tek kapak görseline düşülür.
  const productImages =
    displayData?.images && displayData.images.length > 0
      ? displayData.images
      : displayData?.imageUrl
        ? [displayData.imageUrl]
        : [];

  return {
    // Data + durumlar
    product,
    displayData,
    previewProduct,
    error,
    isError,
    isPending,
    refetch,
    areProductOptionsLoading,
    productImages,
    productCode: displayData ? extractProductCode(displayData.title) : '',
    initialImageIndex,
    shippingEstimate: shippingQuery.data,
    shippingMessage: shippingQuery.data?.message,
    contentBottomPadding: PRODUCT_STICKY_FOOTER_SCROLL_PADDING + insets.bottom,

    // Paket (bundle)
    bundle,

    // Beden seçimi ve stok bildirimi
    selectedVariant,
    setSelectedVariant,
    isSelectedVariantOutOfStock,
    isNotifying,
    isNotifyConfirmationOpen,
    notifyErrorMessage,
    isVariantNotified,
    closeNotifyConfirmation,
    handleNotifyMe,
    applyCalculatedSize,

    // Favori
    isFavorite,
    toggleFavorite,

    // Ürün kodu rozeti ve kaydırma
    showProductCode,
    headerHeight,
    setHeaderHeight,
    handleProductScrollOffset,
    handlePullDismiss,

    // Modal durumları
    showSizeSheet,
    setShowSizeSheet,
    showSizeChart,
    setShowSizeChart,
    showSizeCalculator,
    setShowSizeCalculator,
    showWashing,
    setShowWashing,
    showFeedback,
    setShowFeedback,
    showVideoModal,
    setShowVideoModal,
    galleryImageIndex,
    setGalleryImageIndex,

    // Aksiyonlar
    openReviews,
    openQuestions,
    handleColorSelect,
    handleCategoryPress,
    handleSimilarProductPress,
    handleWhatsappPress,
    handleAddToCart,
    confirmAddToCart,
  };
}
