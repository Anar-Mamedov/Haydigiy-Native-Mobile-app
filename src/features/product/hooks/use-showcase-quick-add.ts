import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { productToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { Product, ProductVariant } from '@/types/product.types';
import { getApiErrorMessage } from '@/utils/api-error';
import { productDetailQueryOptions } from '../api/product.query-options';
import { getShowcaseProductKey, ShowcaseProduct } from '../api/product-showcase.mapper';
import { buildShowcaseProductRoute } from '../utils/showcase-product-route';
import { ProductPricing, resolveVariantPricing } from '../utils/variant-price';

const ADD_TO_CART_ERROR = 'Ürün sepete eklenemedi. Lütfen tekrar deneyin.';
const MISSING_VARIANT_ERROR = 'Bu ürün için beden bilgisi bulunamadı, sepete eklenemedi.';

/**
 * Bedeni hızlı seçim alt sayfasında seçilemeyen ürün detaya gider: paket (her kalem
 * için ayrı beden) ya da bedensiz ürün (web vitriniyle aynı).
 */
function needsDetailScreen(detail: Product): boolean {
  return Boolean(detail.isBundle || !detail.variants?.length);
}

function toShowcasePricing(product: ShowcaseProduct): ProductPricing {
  return {
    discountRate: product.discountRate,
    firstPrice: product.firstPrice,
    hasDiscount: product.hasDiscount,
    price: product.price,
  };
}

/**
 * Ana sayfa vitrinindeki "Sepete Ekle": alt sayfayı hemen açar, bedenleri PDP ile aynı
 * önbellekten çeker ve seçilen bedeni sepete ekler. Kullanıcı ana sayfada kalır; eklenince
 * web'deki bildirime karşılık "Sepete Git" seçeneği sunulur.
 */
export function useShowcaseQuickAdd() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToCart = useAddToCartMutation();
  const [activeProduct, setActiveProduct] = useState<ShowcaseProduct | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  // Alt sayfa kapandıktan ya da başka ürün açıldıktan sonra gelen yanıt yok sayılır.
  const requestIdRef = useRef(0);

  const close = useCallback(() => {
    requestIdRef.current += 1;
    setActiveProduct(null);
    setDetail(null);
  }, []);

  const open = useCallback(
    (product: ShowcaseProduct) => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;
      setSelectedVariant(null);
      setDetail(null);
      setActiveProduct(product);

      // Detay isteği başarısızsa detay ekranı kendi hata durumunu ve yeniden denemesini gösterir.
      const openDetailScreen = () => {
        close();
        router.push(buildShowcaseProductRoute(product) as never);
      };

      void queryClient
        .fetchQuery(productDetailQueryOptions(getShowcaseProductKey(product)))
        .then((loaded) => {
          if (requestIdRef.current !== requestId) return;
          if (needsDetailScreen(loaded)) {
            openDetailScreen();
            return;
          }
          setDetail(loaded);
        })
        .catch(() => {
          if (requestIdRef.current === requestId) openDetailScreen();
        });
    },
    [close, queryClient, router],
  );

  const confirm = useCallback(() => {
    if (!detail) return;

    const variantId = selectedVariant?.pivotId ?? selectedVariant?.id;
    if (!variantId) {
      Alert.alert('Hata', MISSING_VARIANT_ERROR);
      return;
    }

    const size = selectedVariant?.name;
    addToCart.mutate(
      { variantId, tracking: productToInsiderInput(detail, { size, quantity: 1 }) },
      {
        onSuccess: () =>
          Alert.alert('Başarılı', `${detail.title} (${size}) sepetinize eklendi.`, [
            { style: 'cancel', text: 'Alışverişe Devam Et' },
            { onPress: () => router.push('/cart'), text: 'Sepete Git' },
          ]),
        // Hata sessizce yutulmaz; kullanıcı nedenini görür.
        onError: (error) => Alert.alert('Hata', getApiErrorMessage(error, ADD_TO_CART_ERROR)),
      },
    );
    close();
  }, [addToCart, close, detail, router, selectedVariant]);

  const basePricing = detail ?? (activeProduct ? toShowcasePricing(activeProduct) : null);

  return {
    activeProduct,
    close,
    confirm,
    detail,
    isLoadingVariants: Boolean(activeProduct) && !detail,
    isOpen: Boolean(activeProduct),
    open,
    pricing: basePricing ? resolveVariantPricing(basePricing, selectedVariant) : null,
    selectedVariant,
    setSelectedVariant,
  };
}

export type ShowcaseQuickAddController = ReturnType<typeof useShowcaseQuickAdd>;
