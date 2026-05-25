import { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { Paragraph, XStack, YStack } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons-2';
import { useRouter, useFocusEffect } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { AppScreen, EmptyState } from '@/components/ui';
import { ProductCard } from '@/features/product/components/product-card';
import { ViewedProduct, getViewedProducts, clearViewedProducts } from '@/utils/recently-viewed';
import { Product } from '@/types/product.types';

export default function GezdiklerimRoute() {
  const router = useRouter();
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);

  // Load viewed products whenever the page is focused
  useFocusEffect(
    useCallback(() => {
      const loadViewed = async () => {
        const list = await getViewedProducts();
        setViewedProducts(list);
      };
      loadViewed();
    }, [])
  );

  const handleClearAll = async () => {
    await clearViewedProducts();
    setViewedProducts([]);
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}` as any);
  };

  // Map ViewedProduct stored format back into full Product type for <ProductCard /> compat
  const mapToProduct = (item: ViewedProduct): Product => {
    return {
      id: String(item.id),
      title: item.name,
      slug: item.slug,
      imageUrl: item.thumb || '',
      price: Number(item.price || 0),
      brand: 'HaydiGiy',
      category: 'Giyim',
      currency: 'TRY',
      description: '',
      rating: 5,
      reviewCount: 0,
      sellerName: 'HaydiGiy',
      shippingLabel: '',
    };
  };

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
      <XStack alignItems="center" gap="$2" flex={1}>
        <Pressable onPress={handleBackPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
          <ChevronLeft color="$color" size={24} />
        </Pressable>
        <Paragraph fontSize={16} fontWeight="700" color="$color" numberOfLines={1} flex={1}>
          Önceden Gezdiklerim
        </Paragraph>
      </XStack>
      {viewedProducts.length > 0 ? (
        <Pressable onPress={handleClearAll} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 6 })}>
          <Paragraph fontSize={13} fontWeight="600" color="$brand">
            Temizle
          </Paragraph>
        </Pressable>
      ) : null}
    </XStack>
  );

  return (
    <AppScreen scrollable={false} header={customHeader} padding={0} gap={0}>
      {viewedProducts.length > 0 ? (
        <YStack flex={1} width="100%">
          <FlashList
            contentContainerStyle={{
              paddingTop: 8,
              paddingBottom: 24,
              paddingHorizontal: 8,
            }}
            data={viewedProducts}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            renderItem={({ item }) => {
              const product = mapToProduct(item);
              return (
                <YStack flex={1} padding="$1.5">
                  <ProductCard
                    onOpen={() => handleProductPress(product)}
                    product={product}
                    onColorPress={() => {
                      // Color selection not required for simple history list, falls back to detail click
                      handleProductPress(product);
                    }}
                  />
                </YStack>
              );
            }}
          />
        </YStack>
      ) : (
        <EmptyState
          description="Daha önce incelediğiniz herhangi bir ürün bulunmamaktadır."
          title="Henüz Ürün İncelemediniz"
        />
      )}
    </AppScreen>
  );
}
