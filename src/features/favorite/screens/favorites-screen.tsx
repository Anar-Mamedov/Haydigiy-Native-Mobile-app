import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Spinner, YStack, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';

import { AppScreen, EmptyState, ConfirmDialog } from '@/components/ui';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useFavoritesQuery, useRemoveFavoriteMutation } from '../api/favorite.queries';
import { buildProductDetailRoute } from '@/features/product/utils/product-detail-route';
import { getFavoritePricing } from '../utils/favorite-pricing';
import { FavoriteCard } from '../components/favorite-card';
import { FavoritesHeader } from '../components/favorites-header';
import { FavoritesToolbar } from '../components/favorites-toolbar';
import { CategoryFilterSheet } from '../components/category-filter-sheet';
import { SizeSelectorSheet } from '../components/size-selector-sheet';
import { FavoriteItem, FavoritesFilter } from '@/types/favorite.types';
import { Product, ProductVariant } from '@/types/product.types';

export function FavoritesScreen() {
  const router = useRouter();

  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<FavoritesFilter[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSizeSheetOpen, setIsSizeSheetOpen] = useState(false);
  const [activeSizeProduct, setActiveSizeProduct] = useState<FavoriteItem | null>(null);

  const [productToRemove, setProductToRemove] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const addToCart = useAddToCartMutation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: favorites = [], isPending: isListPending, isError, refetch } = useFavoritesQuery(
    debouncedSearch || undefined
  );
  const removeFavoriteMutation = useRemoveFavoriteMutation();

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((fav) => {
      if (fav.product.category) set.add(fav.product.category);
      fav.product.categories?.forEach((c) => {
        if (!c.toLowerCase().includes('tl')) {
          set.add(c);
        }
      });
    });
    return Array.from(set);
  }, [favorites]);

  const toggleFilter = (filter: FavoritesFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const visibleFavorites = useMemo(() => {
    const filtered = favorites.filter((fav) => {
      const product = fav.product;
      const hasStock = product.hasStock ?? (product.variants?.some((v) => v.hasStock) || false);
      const pricing = getFavoritePricing(product);

      const allCategories = new Set<string>([product.category, ...(product.categories || [])]);
      const categoryMatch =
        !selectedCategories.length || selectedCategories.some((c) => allCategories.has(c));

      const conditions: Record<FavoritesFilter, boolean> = {
        inStock: hasStock,
        discounted: pricing.isDiscounted,
      };

      return categoryMatch && activeFilters.every((f) => conditions[f]);
    });

    if (activeFilters.includes('discounted')) {
      return [...filtered].sort(
        (a, b) =>
          getFavoritePricing(b.product).discountAmount -
          getFavoritePricing(a.product).discountAmount
      );
    }

    return filtered;
  }, [favorites, activeFilters, selectedCategories]);

  useEffect(() => {
    setSelectedSizes((prev) => {
      const sizeMap = { ...prev };
      let changed = false;

      favorites.forEach((fav) => {
        if (!sizeMap[fav.product.id] && fav.product.variants?.length) {
          const inStock = fav.product.variants.find((v) => v.hasStock);
          if (inStock) {
            sizeMap[fav.product.id] = inStock.name;
            changed = true;
          }
        }
      });

      return changed ? sizeMap : prev;
    });
  }, [favorites]);

  const handleOpenSizeSelector = (fav: FavoriteItem) => {
    setActiveSizeProduct(fav);
    setIsSizeSheetOpen(true);
  };

  const handleSelectSize = (variant: ProductVariant) => {
    if (activeSizeProduct) {
      setSelectedSizes((prev) => ({
        ...prev,
        [activeSizeProduct.product.id]: variant.name,
      }));
    }
  };

  const handleAddToCart = (product: Product, size: string) => {
    const variant = product.variants?.find((candidate) => candidate.name === size);
    const variantId = variant?.pivotId ?? variant?.id;
    if (variantId) {
      addToCart.mutate({ variantId });
    }
    Alert.alert('Başarılı', `${product.title} (${size}) sepetinize eklendi.`, [
      { text: 'Alışverişe Devam Et', style: 'cancel' },
      { text: 'Sepete Git', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  const handleRemovePress = (productId: string) => {
    setProductToRemove(productId);
    setShowConfirmDialog(true);
  };

  const confirmRemove = async () => {
    if (productToRemove) {
      try {
        await removeFavoriteMutation.mutateAsync(productToRemove);
      } catch {
        Alert.alert('Hata', 'Favori kaldırılırken hata oluştu.');
      }
    }
    setShowConfirmDialog(false);
    setProductToRemove(null);
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const header = <FavoritesHeader onBack={handleBackPress} />;

  if (isAuthLoading) {
    return (
      <AppScreen scrollable={false} header={header} padding={0} gap={0}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$brand" />
        </YStack>
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppScreen scrollable={false} header={header} padding="$4" gap="$4">
        <YStack flex={1} justifyContent="center" alignItems="center" px="$2">
          <EmptyState
            title="Favorilerim İçin Giriş Yapın"
            description="Beğendiğiniz ürünleri favorilerinize eklemek ve listelemek için giriş yapmalısınız."
            actionLabel="Giriş Yap"
            onActionPress={() => router.push('/(tabs)/profile')}
            primary
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable={false} header={header} padding={0} gap={0}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <FavoritesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategoryCount={selectedCategories.length}
          onOpenCategorySheet={() => setIsCategorySheetOpen(true)}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
        />

        {isListPending && !favorites.length ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color="$brand" />
          </YStack>
        ) : isError ? (
          <EmptyState
            title="Hata Oluştu"
            description="Favoriler yüklenirken bir sorun oluştu."
            actionLabel="Tekrar Dene"
            onActionPress={() => refetch()}
            primary
          />
        ) : favorites.length === 0 ? (
          <YStack flex={1} justifyContent="center" px="$4">
            <EmptyState
              title="Henüz favoriniz yok"
              description="Beğendiğiniz ürünleri favorilerinize ekleyin ve kolayca erişin."
              actionLabel="Alışverişe Başla"
              onActionPress={() => router.push('/(tabs)')}
              primary
            />
          </YStack>
        ) : visibleFavorites.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center" px="$6" gap="$3">
            <Paragraph fontSize={15} color="$color10" textAlign="center">
              Filtrelere uygun favori ürün bulunamadı.
            </Paragraph>
          </YStack>
        ) : (
          <YStack flex={1} width="100%">
            <FlashList
              // Top-anchored grid: opt out of FlashList v2's default
              // maintainVisibleContentPosition and iOS auto content-insets, which
              // otherwise insert intermittent blank space above the list on iOS.
              maintainVisibleContentPosition={{ disabled: true }}
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 8 }}
              data={visibleFavorites}
              keyExtractor={(item) => String(item.product.id)}
              numColumns={2}
              renderItem={({ item }) => (
                <YStack flex={1} padding="$1.5">
                  <FavoriteCard
                    favorite={item}
                    onRemovePress={handleRemovePress}
                    onAddToCartPress={handleAddToCart}
                    onOpenSizeSelector={handleOpenSizeSelector}
                    selectedSize={selectedSizes[item.product.id] || null}
                    onProductPress={(prod) => router.push(buildProductDetailRoute(prod))}
                  />
                </YStack>
              )}
            />
          </YStack>
        )}
      </YStack>

      <CategoryFilterSheet
        open={isCategorySheetOpen}
        onOpenChange={setIsCategorySheetOpen}
        categories={categoryOptions}
        selectedCategories={selectedCategories}
        onApply={setSelectedCategories}
      />

      {activeSizeProduct ? (
        <SizeSelectorSheet
          open={isSizeSheetOpen}
          onOpenChange={setIsSizeSheetOpen}
          productName={activeSizeProduct.product.title}
          variants={activeSizeProduct.product.variants || []}
          selectedVariantId={
            activeSizeProduct.product.variants?.find(
              (v) => v.name === selectedSizes[activeSizeProduct.product.id]
            )?.id || null
          }
          onSelect={handleSelectSize}
        />
      ) : null}

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Favorilerden Kaldır"
        description="Bu ürünü favorilerinizden kaldırmak istediğinizden emin misiniz?"
        confirmLabel="Evet, Kaldır"
        cancelLabel="Vazgeç"
        destructive
        isConfirming={removeFavoriteMutation.isPending}
        onConfirm={confirmRemove}
      />
    </AppScreen>
  );
}
