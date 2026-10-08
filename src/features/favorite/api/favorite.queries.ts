import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteKeys } from './favorite.keys';
import { mapFavoriteItemDto } from './favorite.mapper';
import { useFavoriteStore } from '../store/use-favorite-store';
import { addFavoriteDto, getFavoritesDto, removeFavoriteDto } from '@/services/favorite.service';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import {
  InsiderProductInput,
  productToInsiderInput,
} from '@/features/insider/utils/insider-product.mapper';
import { analytics } from '@/features/analytics/services/analytics-dispatcher';
import { trackingSnapshotToAnalyticsProduct } from '@/features/analytics/utils/analytics-product.mapper';
import { Product } from '@/types/product.types';
import { Alert } from 'react-native';
import { isAuthenticated } from '@/features/auth/api/auth-session';

export function useFavoritesQuery(query?: string) {
  return useQuery({
    queryKey: favoriteKeys.list(query),
    queryFn: async () => {
      const response = await getFavoritesDto(query);
      const items = response.favorites.map(mapFavoriteItemDto);

      // Synchronize with the persisted local store if this is a general query
      if (!query) {
        const favoriteIds = items.map((item) => item.product.id);
        useFavoriteStore.getState().setFavorites(favoriteIds);
      }

      return items;
    },
  });
}

export function useAddFavoriteMutation() {
  const queryClient = useQueryClient();
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);

  return useMutation({
    mutationFn: async ({
      productId,
    }: {
      productId: string;
      /** Insider add-to-wishlist snapshot; callers with product context pass it. */
      tracking?: InsiderProductInput;
    }) => {
      const numId = parseInt(productId, 10);
      if (isNaN(numId)) {
        throw new Error('Invalid product ID format');
      }
      return addFavoriteDto(numId);
    },
    onMutate: async ({ productId }) => {
      // Optimistic update
      addFavorite(productId);
      return { productId };
    },
    onError: (_err, _variables, context) => {
      if (context?.productId) {
        removeFavorite(context.productId);
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.tracking) {
        insiderTracker.trackAddToWishlist(variables.tracking);
        analytics.track({
          name: 'add_to_wishlist',
          product: trackingSnapshotToAnalyticsProduct(variables.tracking),
        });
      }
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);

  return useMutation({
    mutationFn: async (productId: string) => {
      const numId = parseInt(productId, 10);
      if (isNaN(numId)) {
        throw new Error('Invalid product ID format');
      }
      return removeFavoriteDto(numId);
    },
    onMutate: async (productId: string) => {
      // Optimistic update
      removeFavorite(productId);
      return { productId };
    },
    onError: (_err, _productId, context) => {
      if (context?.productId) {
        addFavorite(context.productId);
      }
    },
    onSuccess: (_data, productId) => {
      insiderTracker.trackRemoveFromWishlist(productId);
      analytics.track({ name: 'remove_from_wishlist', productId });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

/**
 * Favori ekle/çıkar. Tam `Product` modeli olmayan yüzeyler (ör. ana sayfa vitrini)
 * kimliği ve Insider anlık görüntüsünü kuran fonksiyonu verir; görüntü yalnızca
 * ekleme anında kurulur.
 */
export function useFavoriteToggle(
  productId: string | undefined,
  buildTracking: () => InsiderProductInput | undefined,
) {
  const isFavorite = useFavoriteStore((state) => state.isFavorite(productId ?? ''));
  const addMutation = useAddFavoriteMutation();
  const removeMutation = useRemoveFavoriteMutation();

  const toggleFavorite = useCallback(async () => {
    if (!productId) return;

    if (!(await isAuthenticated())) {
      Alert.alert('Uyarı', 'Giriş yapmadan favorilere eklenemez.');
      return;
    }

    try {
      if (isFavorite) {
        await removeMutation.mutateAsync(productId);
      } else {
        await addMutation.mutateAsync({
          productId,
          tracking: buildTracking(),
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [isFavorite, productId, buildTracking, addMutation, removeMutation]);

  return {
    isFavorite,
    toggleFavorite,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}

export function useToggleFavorite(product?: Product | null) {
  const buildTracking = useCallback(
    () => (product ? productToInsiderInput(product) : undefined),
    [product],
  );

  return useFavoriteToggle(product?.id, buildTracking);
}
