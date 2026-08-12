import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { appStorage } from '@/lib/storage/mmkv';
import { insiderTracker } from '@/features/insider/services/insider-tracker';

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    identifyUser: jest.fn(),
    clearUser: jest.fn(),
    trackUserLogin: jest.fn(),
    trackUserLogout: jest.fn(),
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

  it('sends user_login with the given method after identifying the user', async () => {
    const mockUser = { id: 'user-3', name: 'Anar', email: 'anar@example.com' };

    await useAuthStore.getState().login('test-token-xyz', mockUser, 'otp');

    expect(trackerMock.trackUserLogin).toHaveBeenCalledWith('otp');
    // Sıra önemli: kimlik tanıtılmadan gönderilen event yanlış profile yazılır.
    expect(trackerMock.identifyUser.mock.invocationCallOrder[0]).toBeLessThan(
      trackerMock.trackUserLogin.mock.invocationCallOrder[0],
    );
  });

  it('sends user_login without a method when the caller does not pass one', async () => {
    const mockUser = { id: 'user-4', name: 'Anar', email: 'anar@example.com' };

    await useAuthStore.getState().login('test-token-xyz', mockUser);

    expect(trackerMock.trackUserLogin).toHaveBeenCalledWith(undefined);
  });

  it('sends user_logout before anonymising the user on explicit logout', async () => {
    const mockUser = { id: 'user-5', name: 'Anar', email: 'anar@example.com' };

    await useAuthStore.getState().login('test-token-xyz', mockUser);
    jest.clearAllMocks();

    await useAuthStore.getState().logout();

    expect(trackerMock.trackUserLogout).toHaveBeenCalledWith('user');
    // Sıra önemli: clearUser sonrası kullanıcı anonim olur, event kimliksiz kalır.
    expect(trackerMock.trackUserLogout.mock.invocationCallOrder[0]).toBeLessThan(
      trackerMock.clearUser.mock.invocationCallOrder[0],
    );
  });

  it('marks a dropped session as session_expired instead of a user logout', () => {
    useAuthStore.getState().setUser(null);

    expect(trackerMock.trackUserLogout).toHaveBeenCalledWith('session_expired');
    expect(trackerMock.trackUserLogout.mock.invocationCallOrder[0]).toBeLessThan(
      trackerMock.clearUser.mock.invocationCallOrder[0],
    );
  });

  it('does not send user_login when setUser only refreshes the profile', () => {
    useAuthStore.getState().setUser({ id: 'user-6', name: 'Anar', email: 'anar@example.com' });

    expect(trackerMock.identifyUser).toHaveBeenCalled();
    expect(trackerMock.trackUserLogin).not.toHaveBeenCalled();
  });
});
