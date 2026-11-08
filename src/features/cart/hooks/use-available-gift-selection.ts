import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAddCartGiftMutation } from '@/features/cart/api/cart.queries';
import { AvailableGift, AvailableGiftSize } from '@/types/cart.types';
import { getApiErrorMessage } from '@/utils/api-error';

/** Seçilen beden hâlâ listede ve eklenebilir durumdaysa onu döner. */
function findAddableSize(gift: AvailableGift, variantId: string | undefined): AvailableGiftSize | undefined {
  if (!variantId) return undefined;
  return gift.sizes.find((size) => size.variantId === variantId && size.canAdd);
}

/**
 * "Hediyenizi seçin" kartının durumu: her hediye için seçilen beden ve ekleme
 * isteğinin yaşam döngüsü. Kart sunum katmanıdır; seçim ve istek burada tutulur.
 *
 * Aynı anda tek hediye eklenir. Hata sessizce yutulmaz: backend'in mesajı
 * (stok bitti, kampanya hakkı yok vb.) gösterilir ve mutasyon sepeti tazeler.
 */
export function useAvailableGiftSelection() {
  const addGift = useAddCartGiftMutation();
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({});

  const selectSize = useCallback((productId: string, variantId: string) => {
    setSelectedVariantIds((previous) => ({ ...previous, [productId]: variantId }));
  }, []);

  const canAdd = useCallback(
    (gift: AvailableGift) =>
      !addGift.isPending && findAddableSize(gift, selectedVariantIds[gift.productId]) !== undefined,
    [addGift.isPending, selectedVariantIds],
  );

  const { mutate, isPending } = addGift;
  const add = useCallback(
    (gift: AvailableGift) => {
      const size = findAddableSize(gift, selectedVariantIds[gift.productId]);
      if (isPending || !size) return;

      mutate(
        { gift, variantId: size.variantId },
        {
          onError: (error) => {
            Alert.alert(
              'Hata',
              getApiErrorMessage(error, 'Hediye ürün eklenemedi. Lütfen tekrar deneyin.'),
            );
          },
        },
      );
    },
    [isPending, mutate, selectedVariantIds],
  );

  return {
    selectedVariantIds,
    selectSize,
    canAdd,
    add,
    /** Eklenmekte olan hediyenin ürün kimliği; o sırada diğer hediyeler de kilitlenir. */
    addingProductId: isPending ? addGift.variables?.gift.productId : undefined,
    isAdding: isPending,
  };
}
