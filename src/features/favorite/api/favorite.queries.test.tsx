import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useAddFavoriteMutation,
  useFavoriteToggle,
  useRemoveFavoriteMutation,
} from './favorite.queries';
import { useFavoriteStore } from '../store/use-favorite-store';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import * as favoriteService from '@/services/favorite.service';
import { isAuthenticated } from '@/features/auth/api/auth-session';

jest.mock('@/services/favorite.service', () => ({
  addFavoriteDto: jest.fn(async () => undefined),
  removeFavoriteDto: jest.fn(async () => undefined),
  getFavoritesDto: jest.fn(async () => ({ favorites: [] })),
}));

jest.mock('@/features/auth/api/auth-session', () => ({
  isAuthenticated: jest.fn(async () => true),
}));

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    trackAddToWishlist: jest.fn(),
    trackRemoveFromWishlist: jest.fn(),
  },
}));

const addFavoriteDto = favoriteService.addFavoriteDto as jest.MockedFunction<
  typeof favoriteService.addFavoriteDto
>;
const removeFavoriteDto = favoriteService.removeFavoriteDto as jest.MockedFunction<
  typeof favoriteService.removeFavoriteDto
>;
const trackerMock = insiderTracker as jest.Mocked<typeof insiderTracker>;
const isAuthenticatedMock = isAuthenticated as jest.MockedFunction<typeof isAuthenticated>;

const trackingSnapshot = {
  id: '42',
  name: 'Mavi Elbise',
  taxonomy: ['Elbise'],
  imageUrl: '',
  price: 199.9,
  currency: 'TRY',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  addFavoriteDto.mockResolvedValue(undefined as never);
  removeFavoriteDto.mockResolvedValue(undefined as never);
  useFavoriteStore.setState({ favorites: [] });
  isAuthenticatedMock.mockResolvedValue(true);
});

describe('useAddFavoriteMutation', () => {
  it('adds the favorite optimistically and sends the wishlist event on success', async () => {
    const { result } = renderHook(() => useAddFavoriteMutation(), { wrapper });

    result.current.mutate({ productId: '42', tracking: trackingSnapshot });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(addFavoriteDto).toHaveBeenCalledWith(42);
    expect(useFavoriteStore.getState().favorites).toContain('42');
    expect(trackerMock.trackAddToWishlist).toHaveBeenCalledWith(trackingSnapshot);
  });

  it('rolls back the optimistic add and skips the event when the request fails', async () => {
    addFavoriteDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useAddFavoriteMutation(), { wrapper });

    result.current.mutate({ productId: '42', tracking: trackingSnapshot });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useFavoriteStore.getState().favorites).not.toContain('42');
    expect(trackerMock.trackAddToWishlist).not.toHaveBeenCalled();
  });

  it('still succeeds without a tracking snapshot', async () => {
    const { result } = renderHook(() => useAddFavoriteMutation(), { wrapper });

    result.current.mutate({ productId: '42' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(trackerMock.trackAddToWishlist).not.toHaveBeenCalled();
  });
});

describe('useRemoveFavoriteMutation', () => {
  it('removes the favorite and sends the wishlist-removal event on success', async () => {
    useFavoriteStore.setState({ favorites: ['42'] });

    const { result } = renderHook(() => useRemoveFavoriteMutation(), { wrapper });

    result.current.mutate('42');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeFavoriteDto).toHaveBeenCalledWith(42);
    expect(useFavoriteStore.getState().favorites).not.toContain('42');
    expect(trackerMock.trackRemoveFromWishlist).toHaveBeenCalledWith('42');
  });

  it('rolls back and skips the event when removal fails', async () => {
    useFavoriteStore.setState({ favorites: ['42'] });
    removeFavoriteDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useRemoveFavoriteMutation(), { wrapper });

    result.current.mutate('42');
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useFavoriteStore.getState().favorites).toContain('42');
    expect(trackerMock.trackRemoveFromWishlist).not.toHaveBeenCalled();
  });
});

describe('useFavoriteToggle', () => {
  it('adds a product known only by id with the snapshot built at add time', async () => {
    const buildTracking = jest.fn(() => trackingSnapshot);
    const { result } = renderHook(() => useFavoriteToggle('42', buildTracking), { wrapper });

    await act(() => result.current.toggleFavorite());

    expect(addFavoriteDto).toHaveBeenCalledWith(42);
    expect(buildTracking).toHaveBeenCalledTimes(1);
    expect(trackerMock.trackAddToWishlist).toHaveBeenCalledWith(trackingSnapshot);
    expect(result.current.isFavorite).toBe(true);
  });

  it('removes an existing favorite without building a snapshot', async () => {
    useFavoriteStore.setState({ favorites: ['42'] });
    const buildTracking = jest.fn(() => trackingSnapshot);
    const { result } = renderHook(() => useFavoriteToggle('42', buildTracking), { wrapper });

    await act(() => result.current.toggleFavorite());

    expect(removeFavoriteDto).toHaveBeenCalledWith(42);
    expect(buildTracking).not.toHaveBeenCalled();
  });

  it('asks guests to sign in instead of sending a request', async () => {
    isAuthenticatedMock.mockResolvedValue(false);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { result } = renderHook(() => useFavoriteToggle('42', () => trackingSnapshot), { wrapper });

    await act(() => result.current.toggleFavorite());

    expect(alertSpy).toHaveBeenCalledWith('Uyarı', 'Giriş yapmadan favorilere eklenemez.');
    expect(addFavoriteDto).not.toHaveBeenCalled();
  });
});
