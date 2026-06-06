import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteKeys } from './favorite.keys';
import { mapFavoriteItemDto } from './favorite.mapper';
import { useFavoriteStore } from '../store/use-favorite-store';
import { addFavoriteDto, getFavoritesDto, removeFavoriteDto } from '@/services/favorite.service';
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
    mutationFn: async (productId: string) => {
      const numId = parseInt(productId, 10);
      if (isNaN(numId)) {
        throw new Error('Invalid product ID format');
      }
      return addFavoriteDto(numId);
    },
    onMutate: async (productId: string) => {
      // Optimistic update
      addFavorite(productId);
      return { productId };
    },
    onError: (_err, _productId, context) => {
      if (context?.productId) {
        removeFavorite(context.productId);
      }
    },
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

export function useToggleFavorite(product?: Product | null) {
  const isFavorite = useFavoriteStore((state) => state.isFavorite(product?.id ?? ''));
  const addMutation = useAddFavoriteMutation();
  const removeMutation = useRemoveFavoriteMutation();

  const toggleFavorite = useCallback(async () => {
    if (!product?.id) return;

    if (!(await isAuthenticated())) {
      Alert.alert('Uyarı', 'Giriş yapmadan favorilere eklenemez.');
      return;
    }

    try {
      if (isFavorite) {
        await removeMutation.mutateAsync(product.id);
      } else {
        await addMutation.mutateAsync(product.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [isFavorite, product?.id, addMutation, removeMutation]);

  return {
    isFavorite,
    toggleFavorite,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
