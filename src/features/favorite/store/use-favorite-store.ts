import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';

export type FavoriteState = {
  favorites: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (productIds: string[]) => void;
  clearFavorites: () => void;
};

export function createFavoriteStoreInitialState() {
  return {
    favorites: [] as string[],
  };
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      ...createFavoriteStoreInitialState(),

      addFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites
            : [...state.favorites, productId],
        }));
      },

      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        }));
      },

      toggleFavorite: (productId: string) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(productId)) {
          removeFavorite(productId);
        } else {
          addFavorite(productId);
        }
      },

      isFavorite: (productId: string) => {
        return get().favorites.includes(productId);
      },

      setFavorites: (productIds: string[]) => {
        set({ favorites: productIds });
      },

      clearFavorites: () => {
        set(createFavoriteStoreInitialState());
      },
    }),
    {
      name: 'favorite-storage',
      partialize: (state) => ({ favorites: state.favorites }),
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
