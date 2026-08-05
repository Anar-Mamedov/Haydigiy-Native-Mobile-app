import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { appStorage } from '@/lib/storage/mmkv';
import { insiderTracker } from '@/features/insider/services/insider-tracker';

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    identifyUser: jest.fn(),
    clearUser: jest.fn(),
  },
}));

const trackerMock = insiderTracker as jest.Mocked<typeof insiderTracker>;

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
    jest.clearAllMocks();
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
    // Login introduces the user to Insider (attributes + identifiers).
    expect(trackerMock.identifyUser).toHaveBeenCalledWith(mockUser);
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
    expect(trackerMock.clearUser).toHaveBeenCalled();
  });

  it('sets user correctly using setUser action', () => {
    const mockUser = {
      id: 'user-2',
      name: 'Geliştirici',
      email: 'dev@example.com',
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(trackerMock.identifyUser).toHaveBeenCalledWith(mockUser);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
    expect(trackerMock.clearUser).toHaveBeenCalled();
  });
});
