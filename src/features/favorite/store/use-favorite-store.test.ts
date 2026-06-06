import { appStorage } from '@/lib/storage/mmkv';
import {
  createFavoriteStoreInitialState,
  useFavoriteStore,
} from '@/features/favorite/store/use-favorite-store';

describe('useFavoriteStore', () => {
  beforeEach(() => {
    appStorage.clearAll();
    useFavoriteStore.setState({
      ...createFavoriteStoreInitialState(),
      addFavorite: useFavoriteStore.getState().addFavorite,
      removeFavorite: useFavoriteStore.getState().removeFavorite,
      toggleFavorite: useFavoriteStore.getState().toggleFavorite,
      isFavorite: useFavoriteStore.getState().isFavorite,
      setFavorites: useFavoriteStore.getState().setFavorites,
      clearFavorites: useFavoriteStore.getState().clearFavorites,
    });
  });

  it('adds and removes favorite product IDs', () => {
    useFavoriteStore.getState().addFavorite('product-123');
    expect(useFavoriteStore.getState().favorites).toEqual(['product-123']);
    expect(useFavoriteStore.getState().isFavorite('product-123')).toBe(true);

    useFavoriteStore.getState().removeFavorite('product-123');
    expect(useFavoriteStore.getState().favorites).toEqual([]);
    expect(useFavoriteStore.getState().isFavorite('product-123')).toBe(false);
  });

  it('toggles favorite product IDs correctly', () => {
    useFavoriteStore.getState().toggleFavorite('product-456');
    expect(useFavoriteStore.getState().favorites).toEqual(['product-456']);

    useFavoriteStore.getState().toggleFavorite('product-456');
    expect(useFavoriteStore.getState().favorites).toEqual([]);
  });

  it('sets multiple favorite product IDs at once', () => {
    useFavoriteStore.getState().setFavorites(['prod-1', 'prod-2', 'prod-3']);
    expect(useFavoriteStore.getState().favorites).toEqual(['prod-1', 'prod-2', 'prod-3']);
  });
});
