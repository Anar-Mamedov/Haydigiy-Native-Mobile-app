import { useRef, useState } from 'react';
import { RefreshControl } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Redirect, useRouter } from 'expo-router';
import { FlashList, type FlashListRef } from '@shopify/flash-list';

import { AppScreen, EmptyState, ScrollToTopButton } from '@/components/ui';
import { ProductCard } from '@/features/product/components/product-card';
import { useCartCount } from '@/features/cart/api/cart.queries';
import { CartCampaignBanner } from '@/features/cart/components/cart-campaign-banner';
import { useInfiniteSearchProductsQuery } from '@/features/product/api/product.queries';
import { useQuickFiltersQuery } from '@/features/product/api/quick-filter.queries';
import { useStableCategoryOptions } from '@/features/product/hooks/use-stable-category-options';
import { useSizeShortcutFilter } from '@/features/product/hooks/use-size-shortcut-filter';
import { useTrackListingPageView } from '@/features/insider/hooks/use-insider-page-tracking';
import {
  useTrackAnalyticsCategoryView,
  useTrackAnalyticsSearch,
} from '@/features/analytics/hooks/use-analytics-commerce-tracking';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { Product } from '@/types/product.types';
import { SortSheet } from '../components/sort-sheet';
import { FilterSheet, FilterShortcutSection } from '../components/filter-sheet';
import { ColorVariantsSheet } from '../components/color-variants-sheet';
import { QuickFilterDropdown } from '../components/quick-filter-dropdown';
import { PRODUCT_FILTER_BAR_HEIGHT, ProductFilterBar } from '../components/product-filter-bar';
import { ProductVideoModal } from '../components/product-video-modal';
import { ProductListHeader } from '../components/product-list-header';
import { resolveColorVariantTarget } from '../utils/color-variant-route';
import { buildProductDetailRoute } from '../utils/product-detail-route';
import { ProductListingFilters } from '../utils/listing-deep-link-params';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { isMissingResourceApiError } from '@/utils/api-error';
import { formatSearchResultsHeading } from '@/utils/format-search-heading';

interface ProductListScreenProps {
  slug: string;
  categoryId?: number;
  searchQuery?: string;
  /** Tedarikçi listesi (web `/s/{kod}`); API'ye `s` olarak gider. */
  supplierCode?: string;
  /** Menü tabanlı liste (web `/cok-satanlar` vb.); API'ye `menu_url` olarak gider. */
  menuUrl?: string;
  /**
   * Derin bağlantıdan gelen sıralama/filtre seçimleri. Ekran durumunu yalnızca
   * başlatır; sonrasında kullanıcının sayfa içindeki seçimleri geçerlidir.
   */
  initialFilters?: ProductListingFilters;
}

/** Bu kadar piksel kaydırıldıktan sonra "başa dön" butonu görünür. */
const SCROLL_TO_TOP_THRESHOLD = 400;

export function ProductListScreen({
  slug,
  categoryId,
  searchQuery,
  supplierCode,
  menuUrl,
  initialFilters,
}: ProductListScreenProps) {
  const router = useRouter();
  const listRef = useRef<FlashListRef<Product>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Cart integration — badge count derives from the hydrated cart store.
  const cartCount = useCartCount();

  // Filters & Sorting state — derin bağlantı seçimleriyle başlar, sonra ekran yönetir.
  const [sorting, setSorting] = useState(initialFilters?.sorting ?? '');
  const [colors, setColors] = useState<string | undefined>(initialFilters?.colors);
  const [variants, setVariants] = useState<string | undefined>(initialFilters?.variants);
  const [priceRange, setPriceRange] = useState<string | undefined>(initialFilters?.priceRange);
  const [minPrice, setMinPrice] = useState<string | undefined>(initialFilters?.minPrice);
  const [maxPrice, setMaxPrice] = useState<string | undefined>(initialFilters?.maxPrice);
  const [propertyIds, setPropertyIds] = useState<string | undefined>(initialFilters?.propertyIds);
  const [productCategories, setProductCategories] = useState<string | undefined>(
    initialFilters?.productCategories,
  );

  // Overlay sheets open/close state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickFilterSection, setQuickFilterSection] = useState<FilterShortcutSection | null>(null);

  // Active Color Selection state
  const [activeColorProduct, setActiveColorProduct] = useState<Product | null>(null);
  const [isColorSheetOpen, setIsColorSheetOpen] = useState(false);
  const [activeVideoProduct, setActiveVideoProduct] = useState<Product | null>(null);

  // Selecting a color opens that color's product detail screen, mirroring the web
  // app and the product detail screen's own color picker. Falls back to the active
  // product's slug when a variant has no slug of its own.
  const handleSelectColorVariant = (variant: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
  }) => {
    const target = resolveColorVariantTarget(variant, activeColorProduct?.slug);
    if (!target) return;
    router.push(`/product/${target}` as any);
  };

  // TanStack Infinite Query
  const filters = {
    c: categoryId,
    s: supplierCode,
    menu_url: menuUrl,
    q: searchQuery,
    colors,
    variants,
    price_range: priceRange,
    min_price: minPrice,
    max_price: maxPrice,
    sorting,
    property_ids: propertyIds,
    product_categories: productCategories,
  };

  const {
    data,
    error,
    isPending,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchProductsQuery(filters);

  // Extract products list and metadata
  const products = data ? data.pages.flatMap((page) => page.products) : [];
  const firstPage = data?.pages[0];
  const categoryDetails = firstPage?.category;
  // Web ile aynı öncelik: kategori adı > menü adı > Türkçe başlık biçimli arama
  // sorgusu > "Ürünler" (tedarikçi listesi de bu son başlığı kullanır).
  const listTitle =
    categoryDetails?.name ||
    firstPage?.menuItemName ||
    formatSearchResultsHeading(searchQuery) ||
    'Ürünler';

  // Insider "kategori görüntüleme": only real category listings count, search
  // results (q) are not a category page.
  useTrackListingPageView(
    !searchQuery && categoryDetails?.name ? [categoryDetails.name] : null,
  );

  // Aynı ayrım analytics tarafında da geçerli: arama sonucu kategori ziyareti
  // değildir, bu yüzden iki event ayrı koşullara bağlı.
  useTrackAnalyticsCategoryView(
    searchQuery ? null : (categoryId ?? categoryDetails?.id ?? null),
    categoryDetails?.name,
  );
  useTrackAnalyticsSearch(searchQuery, firstPage?.pagination.total, !isPending);
  const availableFilters = useStableCategoryOptions(firstPage?.availableFilters, Boolean(productCategories));
  const categoryFilterOptions =
    (availableFilters?.productCategories.length ?? 0) + (availableFilters?.categoryChildren.length ?? 0);

  // Curated shortcut groups (web parity). Deep links may omit `c`, so fall back
  // to the id resolved by the search response. The row is a non-blocking
  // enhancement: while loading or on error it simply stays hidden.
  const quickFiltersQuery = useQuickFiltersQuery(categoryId ?? categoryDetails?.id);
  const quickFilterGroups = quickFiltersQuery.data ?? [];
  const sizeShortcuts = useSizeShortcutFilter(categoryId ?? categoryDetails?.id, variants, setVariants);

  if (isMissingResourceApiError(error)) {
    return <Redirect href={NOT_FOUND_ROUTE} />;
  }

  // Active filters count
  const activeFiltersCount =
    (colors ? colors.split(',').length : 0) +
    (variants ? variants.split(',').length : 0) +
    (propertyIds ? propertyIds.split(',').length : 0) +
    (productCategories ? productCategories.split(',').length : 0) +
    (priceRange ? 1 : 0);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleApplyFilters = (newFilters: {
    colors?: string;
    variants?: string;
    price_range?: string;
    min_price?: string;
    max_price?: string;
    property_ids?: string;
    product_categories?: string;
  }) => {
    setColors(newFilters.colors);
    setVariants(newFilters.variants);
    setPriceRange(newFilters.price_range);
    setMinPrice(newFilters.min_price);
    setMaxPrice(newFilters.max_price);
    setPropertyIds(newFilters.property_ids);
    setProductCategories(newFilters.product_categories);
  };

  const handleApplyPartialFilters = (partialFilters: {
    colors?: string;
    variants?: string;
    price_range?: string;
    min_price?: string;
    max_price?: string;
    property_ids?: string;
    product_categories?: string;
  }) => {
    handleApplyFilters({
      colors,
      variants,
      price_range: priceRange,
      min_price: minPrice,
      max_price: maxPrice,
      property_ids: propertyIds,
      product_categories: productCategories,
      ...partialFilters,
    });
  };

  const handleToggleQuickFilter = (section: FilterShortcutSection) => {
    setIsFilterOpen(false);
    setIsSortOpen(false);
    setQuickFilterSection((currentSection) => (currentSection === section ? null : section));
  };

  const handleResetFilters = () => {
    setColors(undefined);
    setVariants(undefined);
    setPriceRange(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPropertyIds(undefined);
    setProductCategories(undefined);
  };

  const handleProductPress = (product: Product, imageIndex = 0) => {
    router.push(buildProductDetailRoute(product, imageIndex));
  };

  const handleVideoModalOpenChange = (open: boolean) => {
    if (!open) {
      setActiveVideoProduct(null);
    }
  };

  const handleListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (quickFilterSection !== null) {
      setQuickFilterSection(null);
    }

    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop((current) => {
      const next = offsetY > SCROLL_TO_TOP_THRESHOLD;
      return next === current ? current : next;
    });
  };

  const handleScrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollToTop(false);
  };

  const customHeader = (
    <ProductListHeader
      cartCount={cartCount}
      onBack={handleBackPress}
      onCartPress={handleCartPress}
      title={listTitle}
    />
  );

  return (
    <AppScreen scrollable={false} header={customHeader} padding={0} gap={0}>
      {/* Sıralama + filtreler tek çubukta ve listeden bağımsız: liste kaysa da
          çubuk ekranda sabit kalır. */}
      <ProductFilterBar
        activeFiltersCount={activeFiltersCount}
        categoryFilterOptions={categoryFilterOptions}
        colors={colors}
        isSortActive={Boolean(sorting)}
        openSection={quickFilterSection}
        priceRange={priceRange}
        productCategories={productCategories}
        propertyIds={propertyIds}
        quickFilterGroups={quickFilterGroups}
        sizeShortcuts={sizeShortcuts}
        variants={variants}
        onFilterPress={() => {
          setQuickFilterSection(null);
          setIsFilterOpen(true);
        }}
        onSortPress={() => {
          setQuickFilterSection(null);
          setIsSortOpen(true);
        }}
        onToggleQuickFilter={handleToggleQuickFilter}
      />

      <QuickFilterDropdown
        activeFilters={{
          colors,
          max_price: maxPrice,
          min_price: minPrice,
          variants,
          price_range: priceRange,
          property_ids: propertyIds,
          product_categories: productCategories,
        }}
        availableFilters={availableFilters}
        onChange={handleApplyPartialFilters}
        onClose={() => setQuickFilterSection(null)}
        quickFilterGroups={quickFilterGroups}
        section={quickFilterSection}
        topOffset={PRODUCT_FILTER_BAR_HEIGHT}
      />

      {/* Initial Page Loading state */}
      {isPending ? (
        <YStack alignItems="center" flex={1} justifyContent="center" gap="$3">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10">Ürünler yükleniyor...</Paragraph>
        </YStack>
      ) : null}

      {/* Error state */}
      {isError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Ürün listesi yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onActionPress={() => refetch()}
          title="Ürünler Yüklenemedi"
        />
      ) : null}

      {/* Product List Grid */}
      {!isPending && !isError && (
        <YStack flex={1} width="100%">
          <FlashList
            // FlashList v2 enables maintainVisibleContentPosition by default (for
            // chat-like lists); on iOS it intermittently inserts blank space above
            // the header when content height changes (refresh / pagination / header
            // re-measure). This catalog is top-anchored, so disable it. Pair with
            // contentInsetAdjustmentBehavior="never" to stop iOS auto top-insets.
            maintainVisibleContentPosition={{ disabled: true }}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 24,
              paddingHorizontal: 8,
            }}
            data={products}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            onScroll={handleListScroll}
            ref={listRef}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                colors={[BRAND_COLOR]}
                onRefresh={refetch}
                refreshing={isFetching && !isFetchingNextPage}
                tintColor={BRAND_COLOR}
              />
            }
            // Kampanya bandı listenin başlığı olarak akar; web'de olduğu gibi
            // listelemenin en üstünde durur ve içerikle birlikte yukarı kayar.
            ListHeaderComponent={<CartCampaignBanner />}
            ListEmptyComponent={
              <EmptyState
                actionLabel={activeFiltersCount > 0 ? 'Filtreleri Temizle' : undefined}
                description={
                  activeFiltersCount > 0
                    ? 'Seçtiğiniz filtre değerlerine uygun ürün bulunamadı. Filtreleri sıfırlayarak tekrar deneyebilirsiniz.'
                    : 'Bu kategoride henüz sergilenecek ürün bulunmamaktadır.'
                }
                onActionPress={activeFiltersCount > 0 ? handleResetFilters : undefined}
                title="Ürün Bulunamadı"
              />
            }
            renderItem={({ item }) => (
              <YStack flex={1} padding="$1.5">
                <ProductCard
                  onOpen={(imageIndex) => handleProductPress(item, imageIndex)}
                  onVideoPress={setActiveVideoProduct}
                  product={item}
                  onColorPress={() => {
                    setActiveColorProduct(item);
                    setIsColorSheetOpen(true);
                  }}
                />
              </YStack>
            )}
            ListFooterComponent={
              isFetchingNextPage ? (
                <YStack paddingVertical="$4" alignItems="center" justifyContent="center">
                  <Spinner color="$brand" size="small" />
                </YStack>
              ) : null
            }
          />

          <ScrollToTopButton onPress={handleScrollToTop} visible={showScrollToTop} />
        </YStack>
      )}

      {/* Sorting Sheet */}
      <SortSheet
        open={isSortOpen}
        onOpenChange={setIsSortOpen}
        selectedValue={sorting}
        onSelect={setSorting}
      />

      {/* Filtering Sheet */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        availableFilters={availableFilters}
        activeFilters={filters}
        onApply={handleApplyFilters}
      />

      {/* Color Variants Sheet */}
      <ColorVariantsSheet
        open={isColorSheetOpen}
        onOpenChange={setIsColorSheetOpen}
        product={activeColorProduct}
        selectedVariantId={activeColorProduct?.id ?? null}
        onSelectVariant={handleSelectColorVariant}
      />

      {activeVideoProduct?.videoPath ? (
        <ProductVideoModal
          onOpenChange={handleVideoModalOpenChange}
          open={Boolean(activeVideoProduct.videoPath)}
          videoUri={activeVideoProduct.videoPath}
          product={activeVideoProduct}
          onPrimaryCta={() => {
            handleVideoModalOpenChange(false);
            if (activeVideoProduct) {
              handleProductPress(activeVideoProduct);
            }
          }}
        />
      ) : null}
    </AppScreen>
  );
}
