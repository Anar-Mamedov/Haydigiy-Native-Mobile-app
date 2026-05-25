import { useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { Paragraph, Spinner, XStack, YStack, ScrollView, Button } from 'tamagui';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, ShoppingCart } from '@tamagui/lucide-icons-2';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { AppScreen, EmptyState } from '@/components/ui';
import { ProductCard } from '@/features/product/components/product-card';
import { useCartStore, calculateCartItemCount } from '@/features/cart/store/use-cart-store';
import { useInfiniteSearchProductsQuery } from '@/features/product/api/product.queries';
import { useStableCategoryOptions } from '@/features/product/hooks/use-stable-category-options';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { Product } from '@/types/product.types';
import { SortSheet, SORT_OPTIONS } from '../components/sort-sheet';
import { FilterSheet, FilterShortcutSection } from '../components/filter-sheet';
import { ColorVariantsSheet } from '../components/color-variants-sheet';
import { QuickFilterDropdown } from '../components/quick-filter-dropdown';
import { FilterPill } from '../components/filter-pill';

interface ProductListScreenProps {
  slug: string;
  categoryId?: number;
  searchQuery?: string;
}

export function ProductListScreen({ slug, categoryId, searchQuery }: ProductListScreenProps) {
  const router = useRouter();

  // Cart integration
  const cartItems = useCartStore((state) => state.items);
  const cartCount = calculateCartItemCount(cartItems);

  // Filters & Sorting state
  const [sorting, setSorting] = useState('');
  const [colors, setColors] = useState<string | undefined>(undefined);
  const [variants, setVariants] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<string | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<string | undefined>(undefined);
  const [propertyIds, setPropertyIds] = useState<string | undefined>(undefined);
  const [productCategories, setProductCategories] = useState<string | undefined>(undefined);

  // Overlay sheets open/close state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickFilterSection, setQuickFilterSection] = useState<FilterShortcutSection | null>(null);

  // Quick Filter Sections & Active Color Selection state
  const [selectedVariantsMap, setSelectedVariantsMap] = useState<Record<string, Product>>({});
  const [activeColorProduct, setActiveColorProduct] = useState<Product | null>(null);
  const [isColorSheetOpen, setIsColorSheetOpen] = useState(false);

  const handleSelectColorVariant = (variant: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
  }) => {
    if (!activeColorProduct) return;

    const updatedProduct: Product = {
      ...activeColorProduct,
      id: variant.id,
      slug: variant.slug,
      title: variant.name,
      imageUrl: variant.imageUrl,
      price: variant.price,
      images: [variant.imageUrl], // Display selected variant thumbnail in carousel
    };

    setSelectedVariantsMap((prev) => ({
      ...prev,
      [activeColorProduct.id]: updatedProduct,
    }));
  };

  // TanStack Infinite Query
  const filters = {
    c: categoryId,
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
  const availableFilters = useStableCategoryOptions(firstPage?.availableFilters, Boolean(productCategories));
  const categoryFilterOptions =
    (availableFilters?.productCategories.length ?? 0) + (availableFilters?.categoryChildren.length ?? 0);

  // Active filters count
  const activeFiltersCount =
    (colors ? colors.split(',').length : 0) +
    (variants ? variants.split(',').length : 0) +
    (propertyIds ? propertyIds.split(',').length : 0) +
    (productCategories ? productCategories.split(',').length : 0) +
    (priceRange ? 1 : 0);

  const activeSortLabel = SORT_OPTIONS.find((opt) => opt.value === sorting)?.label || 'Önerilen Sıralama';

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleCartPress = () => {
    router.push('/(tabs)/cart');
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
    setSelectedVariantsMap({}); // Reset color variant selections
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  // Custom Navigation Header
  const customHeader = (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingHorizontal="$3"
      paddingVertical="$2"
      gap="$2"
      height={56}
      width="100%"
      justifyContent="space-between"
    >
      <XStack alignItems="center" gap="$2" flex={1} minWidth={0}>
        <Pressable onPress={handleBackPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
          <ArrowLeft color="$color" size={24} />
        </Pressable>
        <Paragraph fontSize={16} fontWeight="700" color="$color" numberOfLines={1} flex={1}>
          {categoryDetails?.name || searchQuery || 'Ürünler'}
        </Paragraph>
      </XStack>

      <Pressable onPress={handleCartPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 6, position: 'relative' })}>
        <ShoppingCart color="$color" size={22} />
        {cartCount > 0 ? (
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius={10}
            height={18}
            justifyContent="center"
            minWidth={18}
            paddingHorizontal={4}
            position="absolute"
            right={-2}
            top={-2}
          >
            <Paragraph color="white" fontSize={10} fontWeight="900" textAlign="center">
              {cartCount > 9 ? '9+' : cartCount}
            </Paragraph>
          </XStack>
        ) : null}
      </Pressable>
    </XStack>
  );

  return (
    <AppScreen scrollable={false} header={customHeader} padding={0} gap={0}>
      {/* Filters and Sorting Toolbar */}
      <XStack
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="$background"
        height={46}
        width="100%"
      >
        <Button
          flex={1}
          height="100%"
          variant="outlined"
          borderWidth={0}
          borderRadius={0}
          borderRightWidth={1}
          borderRightColor="$borderColor"
          onPress={() => {
            setQuickFilterSection(null);
            setIsSortOpen(true);
          }}
          icon={<ArrowUpDown size={16} color="$brand" />}
        >
          <Paragraph
            fontSize={13}
            fontWeight="500"
            color="$color"
            numberOfLines={1}
          >
            {activeSortLabel}
          </Paragraph>
        </Button>
        <Button
          flex={1}
          height="100%"
          variant="outlined"
          borderWidth={0}
          borderRadius={0}
          onPress={() => {
            setQuickFilterSection(null);
            setIsFilterOpen(true);
          }}
          icon={<SlidersHorizontal size={16} color="$brand" />}
        >
          <Paragraph
            fontSize={13}
            fontWeight="500"
            color="$color"
          >
            Filtrele{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </Paragraph>
        </Button>
      </XStack>

      {/* Horizontal Quick-Filter Pills Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        paddingVertical={8}
        height={48}
        maxHeight={48}
        flex={0}
      >
        <XStack paddingHorizontal="$3" gap="$2" alignItems="center" height="100%">
          {categoryFilterOptions > 0 ? (
            <FilterPill
              label="Kategori"
              isActive={Boolean(productCategories)}
              isOpen={quickFilterSection === 'categories'}
              onPress={() => handleToggleQuickFilter('categories')}
            />
          ) : null}

          <FilterPill
            label="Renk"
            isActive={Boolean(colors)}
            isOpen={quickFilterSection === 'colors'}
            onPress={() => handleToggleQuickFilter('colors')}
          />

          <FilterPill
            label="Beden"
            isActive={Boolean(variants)}
            isOpen={quickFilterSection === 'variants'}
            onPress={() => handleToggleQuickFilter('variants')}
          />

          <FilterPill
            label="Fiyat"
            isActive={Boolean(priceRange)}
            isOpen={quickFilterSection === 'price'}
            onPress={() => handleToggleQuickFilter('price')}
          />
        </XStack>
      </ScrollView>

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
        section={quickFilterSection}
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
          {products.length > 0 ? (
            <FlashList
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
              refreshControl={
                <RefreshControl
                  colors={[BRAND_COLOR]}
                  onRefresh={refetch}
                  refreshing={isFetching && !isFetchingNextPage}
                  tintColor={BRAND_COLOR}
                />
              }
              renderItem={({ item }) => {
                const displayedProduct = selectedVariantsMap[item.id] || item;
                return (
                  <YStack flex={1} padding="$1.5">
                    <ProductCard
                      onOpen={() => handleProductPress(displayedProduct)}
                      product={displayedProduct}
                      onColorPress={() => {
                        setActiveColorProduct(item);
                        setIsColorSheetOpen(true);
                      }}
                    />
                  </YStack>
                );
              }}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <YStack paddingVertical="$4" alignItems="center" justifyContent="center">
                    <Spinner color="$brand" size="small" />
                  </YStack>
                ) : null
              }
            />
          ) : (
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
          )}
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
        selectedVariantId={activeColorProduct ? (selectedVariantsMap[activeColorProduct.id]?.id || activeColorProduct.id) : null}
        onSelectVariant={handleSelectColorVariant}
      />
    </AppScreen>
  );
}
