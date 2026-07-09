import { useState, useEffect, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Input, Paragraph, Spinner, XStack, YStack, ScrollView, useTheme } from 'tamagui';
import { ChevronLeft, Search, X } from '@tamagui/lucide-icons-2';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';

import { AppScreen } from '@/components/ui';
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
      paddingHorizontal="$3"
      paddingVertical="$2"
      gap="$2"
      height={56}
      width="100%"
    >
      <Pressable onPress={handleBackPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
        <ChevronLeft color="$color" size={24} />
      </Pressable>
      <XStack
        flex={1}
        alignItems="center"
        backgroundColor="$backgroundHover"
        borderRadius={8}
        borderWidth={1}
        borderColor="$borderColor"
        paddingHorizontal="$3"
        height={42}
      >
        <Input
          flex={1}
          height="100%"
          backgroundColor="transparent"
          borderWidth={0}
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
          <Pressable onPress={handleClear} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
            <X color="#9ca3af" size={16} />
          </Pressable>
        ) : null}
        <Pressable onPress={handleSearchSubmit} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4, marginLeft: 4 })}>
          <Search color="#9ca3af" size={18} />
        </Pressable>
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
              <Pressable onPress={handleSearchSubmit}>
                {({ pressed }) => (
                  <Paragraph color="$brand" fontSize={14} fontWeight="700" opacity={pressed ? 0.7 : 1}>
                    Yine de ara
                  </Paragraph>
                )}
              </Pressable>
            </YStack>
          )
        ) : (
          // Default Mode (history and viewed products)
          <YStack pb={30}>
            {/* Recent Searches Section */}
            <YStack paddingHorizontal="$4" paddingTop="$4" gap="$2">
              <XStack justifyContent="space-between" alignItems="center" height={24}>
                <Paragraph fontSize={14} fontWeight="700" color="$color">
                  Geçmiş Aramalar
                </Paragraph>
                {recentSearches.length > 0 ? (
                  <Pressable onPress={handleClearHistory}>
                    {({ pressed }) => (
                      <Paragraph fontSize={12} color="$color10" opacity={pressed ? 0.6 : 1}>
                        Temizle
                      </Paragraph>
                    )}
                  </Pressable>
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
              <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" height={24}>
                <Paragraph fontSize={14} fontWeight="700" color="$color">
                  Önceden Gezdiklerim
                </Paragraph>
                {viewedProducts.length > 0 ? (
                  <Pressable onPress={() => router.push('/gezdiklerim')}>
                    {({ pressed }) => (
                      <Paragraph fontSize={12} fontWeight="600" color="$brand" opacity={pressed ? 0.7 : 1}>
                        Tümünü Gör
                      </Paragraph>
                    )}
                  </Pressable>
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
