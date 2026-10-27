import { useState, useEffect, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Input, Spinner, XStack, YStack, ScrollView, useTheme } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronLeft, Search, X } from '@/components/ui/icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';

import {
  AppScreen,
  HeaderBackButton,
  IconButton,
  MIN_TOUCH_TARGET,
  TextActionButton,
  getTextFieldLabelProps,
} from '@/components/ui';
import { usePopularProductsQuery, useSearchSuggestionsQuery } from '@/features/product/api/product.queries';
import { PopularProductsSection } from '@/features/product/components/popular-products-section';
import { formatCurrency } from '@/utils/format-currency';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  getViewedProducts,
  ViewedProduct,
} from '@/utils/recently-viewed';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';

const SECTION_HEADER_HEIGHT = 24;
/** Bölüm başlığındaki 48dp yazılı aksiyon, 24dp satırı büyütmeden bu kadar taşar. */
const HEADER_ACTION_OUTSET = (MIN_TOUCH_TARGET - SECTION_HEADER_HEIGHT) / 2;

export function SearchSuggestionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  
  // Search query states
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Local storage states
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const showSuggestions = query.trim().length >= 3;

  // Debounce the query for mobile (500ms debounce feels snappier than web's 1500ms but still prevents server overload)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Load history and viewed products when page focuses
  useFocusEffect(
    useCallback(() => {
      const loadStorageData = async () => {
        const history = await getSearchHistory();
        const viewed = await getViewedProducts();
        setRecentSearches(history);
        setViewedProducts(viewed);
      };
      loadStorageData();
    }, [])
  );

  const { data: suggestions, isPending: isSuggestionsLoading } = useSearchSuggestionsQuery(debouncedQuery);
  const {
    data: popularProducts = [],
    isError: isPopularProductsError,
    isPending: isPopularProductsLoading,
    isSuccess: isPopularProductsSuccess,
    refetch: refetchPopularProducts,
  } = usePopularProductsQuery(!showSuggestions);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleSearchSubmit = async () => {
    const trimmed = query.trim();
    if (trimmed) {
      await addSearchHistory(trimmed);
      router.push({
        pathname: '/kategori/search',
        params: { q: trimmed },
      } as any);
    }
  };

  const handleHistoryItemPress = async (term: string) => {
    await addSearchHistory(term);
    router.push({
      pathname: '/kategori/search',
      params: { q: term },
    } as any);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setRecentSearches([]);
  };

  const handleProductPress = (id: string | number) => {
    router.push(`/product/${id}` as any);
  };

  const handleCategoryPress = (slug: string, id: number) => {
    router.push({
      pathname: `/kategori/${slug}`,
      params: { c: String(id) },
    } as any);
  };

  // Custom Navigation Header containing the Input box
  const customHeader = (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingLeft="$1.5"
      paddingRight="$3"
      gap="$1.5"
      height={56}
      width="100%"
    >
      <HeaderBackButton Icon={ChevronLeft} onPress={handleBackPress} />
      {/* Arama alanının kendisi (EditText) ve içindeki ikon butonları 48dp; çerçeve kutuya eklenir,
          böylece çerçeve payı alanı 48dp'nin altına indirmez. */}
      <XStack
        flex={1}
        alignItems="center"
        backgroundColor="$backgroundHover"
        borderRadius={8}
        borderWidth={1}
        borderColor="$borderColor"
        paddingLeft="$3"
      >
        <Input
          {...getTextFieldLabelProps({ label: 'Ürün veya kategori ara', placeholder: 'Ürün veya kategori ara' })}
          flex={1}
          minHeight={MIN_TOUCH_TARGET}
          backgroundColor="transparent"
          borderWidth={0}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          padding={0}
          fontSize={14}
          color="$color"
          placeholderTextColor="$color9"
          placeholder="Ürün veya kategori ara"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          autoFocus
        />
        {query ? (
          <IconButton accessibilityLabel="Aramayı temizle" onPress={handleClear}>
            <X color="$color9" size={16} />
          </IconButton>
        ) : null}
        <IconButton accessibilityLabel="Ara" onPress={handleSearchSubmit}>
          <Search color="$color9" size={18} />
        </IconButton>
      </XStack>
    </XStack>
  );

  return (
    <AppScreen scrollable={false} header={customHeader} padding={0} gap={0}>
      <ScrollView flex={1} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {showSuggestions ? (
          // Suggestions Mode (loading spinner or suggestion sections)
          isSuggestionsLoading ? (
            <YStack alignItems="center" justifyContent="center" padding="$6" gap="$3">
              <Spinner color="$brand" size="large" />
              <Paragraph color="$color10" fontSize={14}>Aranıyor...</Paragraph>
            </YStack>
          ) : suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) ? (
            <YStack pb={50}>
              {/* Suggested Products Section */}
              {suggestions.products.length > 0 ? (
                <YStack>
                  <XStack
                    backgroundColor="$backgroundHover"
                    borderBottomWidth={1}
                    borderBottomColor="$borderColor"
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                  >
                    <Paragraph fontSize={12} fontWeight="700" color="$color10">
                      ÜRÜNLER
                    </Paragraph>
                  </XStack>
                  <YStack>
                    {suggestions.products.slice(0, 8).map((product) => (
                      <Pressable
                        key={`product-${product.id}`}
                        onPress={() => handleProductPress(product.id)}
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? theme.backgroundHover.val : theme.background.val,
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.borderColor.val,
                        })}
                      >
                        <YStack
                          width={48}
                          height={48}
                          borderRadius={4}
                          backgroundColor="$backgroundHover"
                          overflow="hidden"
                          marginRight={12}
                        >
                          <Image
                            source={{ uri: product.image }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        </YStack>
                        <Paragraph fontSize={14} color="$color" numberOfLines={1} flex={1}>
                          {product.name}
                        </Paragraph>
                      </Pressable>
                    ))}
                  </YStack>
                </YStack>
              ) : null}

              {/* Suggested Categories Section */}
              {suggestions.categories.length > 0 ? (
                <YStack marginTop="$3">
                  <XStack
                    backgroundColor="$backgroundHover"
                    borderBottomWidth={1}
                    borderBottomColor="$borderColor"
                    paddingHorizontal="$4"
                    paddingVertical="$2"
                  >
                    <Paragraph fontSize={12} fontWeight="700" color="$color10">
                      KATEGORİLER
                    </Paragraph>
                  </XStack>
                  <YStack>
                    {suggestions.categories.slice(0, 5).map((category) => (
                      <Pressable
                        key={`category-${category.id}`}
                        onPress={() => handleCategoryPress(category.slug, category.id)}
                        style={({ pressed }) => ({
                          backgroundColor: pressed ? theme.backgroundHover.val : theme.background.val,
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.borderColor.val,
                        })}
                      >
                        <XStack
                          width={32}
                          height={32}
                          borderRadius={16}
                          backgroundColor="$brand"
                          alignItems="center"
                          justifyContent="center"
                          marginRight={12}
                        >
                          <Paragraph color="white" fontSize={14} fontWeight="700">
                            {category.name.charAt(0).toUpperCase()}
                          </Paragraph>
                        </XStack>
                        <Paragraph fontSize={14} color="$color" numberOfLines={1} flex={1}>
                          {category.name}
                        </Paragraph>
                      </Pressable>
                    ))}
                  </YStack>
                </YStack>
              ) : null}
            </YStack>
          ) : (
            // No results for suggestions
            <YStack alignItems="center" justifyContent="center" padding="$8" gap="$3">
              <Search color="$color8" size={48} />
              <Paragraph color="$color" fontSize={15} textAlign="center" paddingHorizontal="$4">
                {`"${query}" için sonuç bulunamadı`}
              </Paragraph>
              <TextActionButton color="$brand" fontSize={14} label="Yine de ara" onPress={handleSearchSubmit} />
            </YStack>
          )
        ) : (
          // Default Mode (history and viewed products)
          <YStack pb={30}>
            {/* Recent Searches Section */}
            <YStack paddingHorizontal="$4" paddingTop="$4" gap="$2">
              <XStack justifyContent="space-between" alignItems="center" height={SECTION_HEADER_HEIGHT}>
                <Paragraph fontSize={14} fontWeight="700" color="$color">
                  Geçmiş Aramalar
                </Paragraph>
                {recentSearches.length > 0 ? (
                  <YStack marginVertical={-HEADER_ACTION_OUTSET}>
                    <TextActionButton
                      accessibilityLabel="Geçmiş aramaları temizle"
                      color="$color10"
                      fontWeight="400"
                      label="Temizle"
                      onPress={handleClearHistory}
                    />
                  </YStack>
                ) : null}
              </XStack>

              {recentSearches.length > 0 ? (
                <YStack borderTopWidth={1} borderTopColor="$borderColor" marginTop="$2">
                  {recentSearches.map((term, index) => (
                    <Pressable
                      key={`${term}-${index}`}
                      onPress={() => handleHistoryItemPress(term)}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? theme.backgroundHover.val : 'transparent',
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.borderColor.val,
                      })}
                    >
                      <Paragraph fontSize={14} color="$color">
                        {term}
                      </Paragraph>
                    </Pressable>
                  ))}
                </YStack>
              ) : (
                <Paragraph fontSize={14} color="$color10" marginTop="$2">
                  Henüz geçmiş arama yok
                </Paragraph>
              )}
            </YStack>

            <PopularProductsSection
              isEmpty={isPopularProductsSuccess && popularProducts.length === 0}
              isError={isPopularProductsError}
              isLoading={isPopularProductsLoading}
              onProductPress={(product) => handleProductPress(product.slug)}
              onRetry={() => {
                void refetchPopularProducts();
              }}
              products={popularProducts}
            />

            {/* Recently Viewed Products Section */}
            <YStack paddingTop="$5" gap="$2">
              <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" height={SECTION_HEADER_HEIGHT}>
                <Paragraph fontSize={14} fontWeight="700" color="$color">
                  Önceden Gezdiklerim
                </Paragraph>
                {viewedProducts.length > 0 ? (
                  <YStack marginVertical={-HEADER_ACTION_OUTSET}>
                    <TextActionButton
                      accessibilityLabel="Önceden gezdiğim tüm ürünleri gör"
                      color="$brand"
                      fontWeight="600"
                      label="Tümünü Gör"
                      onPress={() => router.push('/gezdiklerim')}
                    />
                  </YStack>
                ) : null}
              </XStack>

              {viewedProducts.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 10 }}>
                  {viewedProducts.map((p) => (
                    <Pressable key={p.id} onPress={() => handleProductPress(p.id)}>
                      {({ pressed }) => (
                        <YStack
                          borderColor="$borderColor"
                          borderWidth={1}
                          borderRadius={6}
                          overflow="hidden"
                          width={110}
                          backgroundColor="$background"
                          opacity={pressed ? 0.9 : 1}
                          shadowColor="rgba(0,0,0,0.05)"
                          shadowRadius={4}
                          shadowOffset={{ width: 0, height: 2 }}
                        >
                          <YStack aspectRatio={3 / 4} backgroundColor="$backgroundHover" position="relative">
                            {p.thumb ? (
                              <Image
                                source={{ uri: p.thumb }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="contain"
                              />
                            ) : null}
                          </YStack>
                          <YStack padding="$2" alignItems="center" justifyContent="center" height={36}>
                            {p.price ? (
                              <Paragraph fontSize={12} fontWeight="700" color="$brand">
                                {formatCurrency(Number(p.price))}
                              </Paragraph>
                            ) : null}
                          </YStack>
                        </YStack>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Paragraph fontSize={14} color="$color10" paddingHorizontal="$4" marginTop="$2">
                  Henüz gezdiğiniz ürün yok
                </Paragraph>
              )}
            </YStack>
          </YStack>
        )}
      </ScrollView>
    </AppScreen>
  );
}
