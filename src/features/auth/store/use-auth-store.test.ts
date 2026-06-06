import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { appStorage } from '@/lib/storage/mmkv';

describe('useAuthStore', () => {
  beforeEach(async () => {
    appStorage.clearAll();
    // Reset Zustand store state
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });
    // Explicitly call logout to ensure SecureStore is cleared
    await useAuthStore.getState().logout();
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });
  });

  it('initially has no authenticated user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('authenticates user and saves token in SecureStore on login', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Anar',
      surname: 'Mamedov',
      email: 'anar@example.com',
      phoneNumber: '5551234567',
    };

    await useAuthStore.getState().login('test-token-xyz', mockUser);

    expect(useAuthStore.getState().user).toEqual(mockUser);
    const storedToken = await getAccessToken();
    expect(storedToken).toBe('test-token-xyz');
  });

  it('resets user state and deletes token on logout', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Anar',
      email: 'anar@example.com',
    };

    await useAuthStore.getState().login('test-token-xyz', mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();

    const storedToken = await getAccessToken();
    expect(storedToken).toBeNull();
  });

  it('sets user correctly using setUser action', () => {
    const mockUser = {
      id: 'user-2',
      name: 'Geliştirici',
      email: 'dev@example.com',
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
