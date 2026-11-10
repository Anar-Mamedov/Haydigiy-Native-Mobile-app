import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { appStorage } from '@/lib/storage/mmkv';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { logoutApi } from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  logoutApi: jest.fn(),
}));

const logoutApiMock = logoutApi as jest.MockedFunction<typeof logoutApi>;

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    identifyUser: jest.fn(),
    refreshUserAttributes: jest.fn(),
    markIdentityChangeIfNeeded: jest.fn(),
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
    logoutApiMock.mockResolvedValue(undefined);
  });

  /**
   * Regresyon (HMA-60): çıkış yalnızca cihazdaki token'ı siliyordu, token sunucuda geçerli
   * kalıyordu. İstek token'ı SecureStore'dan okuduğu için token silinmeden önce gitmelidir.
   */
  const sessionUser = { id: 'user-9', name: 'Anar', email: 'anar@example.com' };

  it('revokes the token on the server before deleting it from the device', async () => {
    await useAuthStore.getState().login('test-token-xyz', sessionUser);
    let tokenDuringRequest: string | null = null;
    logoutApiMock.mockImplementationOnce(async () => {
      tokenDuringRequest = await getAccessToken();
    });

    await useAuthStore.getState().logout();

    expect(logoutApiMock).toHaveBeenCalledTimes(1);
    expect(tokenDuringRequest).toBe('test-token-xyz');
    expect(await getAccessToken()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('still signs out locally when the server request fails', async () => {
    await useAuthStore.getState().login('test-token-xyz', sessionUser);
    logoutApiMock.mockRejectedValueOnce(new Error('Network Error'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

    expect(await getAccessToken()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(trackerMock.trackUserLogout).toHaveBeenCalledWith('user');
    warnSpy.mockRestore();
  });

  it('skips the server request when the token is already revoked', async () => {
    await useAuthStore.getState().login('test-token-xyz', sessionUser);

    await useAuthStore.getState().logout({ revokeServerSession: false });

    expect(logoutApiMock).not.toHaveBeenCalled();
    expect(await getAccessToken()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('does not call the server when the session expires on its own', () => {
    useAuthStore.getState().setUser(null);

    expect(logoutApiMock).not.toHaveBeenCalled();
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
    expect(trackerMock.refreshUserAttributes).toHaveBeenCalledWith(mockUser);

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

    expect(trackerMock.refreshUserAttributes).toHaveBeenCalled();
    expect(trackerMock.trackUserLogin).not.toHaveBeenCalled();
  });

  /**
   * Regresyon: profil güncellemesi `identifyUser` çağırdığı için yeni e-posta cihazdan
   * doğrudan Insider'a gidiyordu. Bu çağrı, backend'in Update Identifiers isteği kuyrukta
   * beklerken Insider'a önce ulaşıp ikinci bir profil açtırıyordu; kimliği artık yalnızca
   * backend değiştirir.
   */
  it('does not push the new identifier to Insider when the profile e-mail changes', async () => {
    await useAuthStore.getState().login('test-token-xyz', {
      id: 'user-7',
      name: 'Anar',
      email: 'eski@example.com',
      phoneNumber: '5551234567',
    });
    jest.clearAllMocks();

    useAuthStore.getState().setUser({
      id: 'user-7',
      name: 'Anar',
      email: 'yeni@example.com',
      phoneNumber: '5559876543',
    });

    expect(trackerMock.identifyUser).not.toHaveBeenCalled();
    expect(trackerMock.refreshUserAttributes).toHaveBeenCalledTimes(1);
  });

  /**
   * Regresyon: değişikliği bildiren tek yer burası. Önceki kullanıcı iletilmezse bekleme
   * penceresi hiç açılmaz ve kayıttan hemen sonraki açılış/giriş yeni e-postayı Insider'a
   * backend'den önce tanıtır.
   */
  it('reports the saved user together with the previous one to Insider', async () => {
    const previousUser = {
      id: 'user-8',
      name: 'Anar',
      email: 'eski@example.com',
      phoneNumber: '5551234567',
    };
    await useAuthStore.getState().login('test-token-xyz', previousUser);
    jest.clearAllMocks();

    const savedUser = { ...previousUser, email: 'yeni@example.com' };
    useAuthStore.getState().setUser(savedUser);

    expect(trackerMock.markIdentityChangeIfNeeded).toHaveBeenCalledWith(previousUser, savedUser);
  });

  it('does not report an identifier change when the session expires', () => {
    useAuthStore.getState().setUser(null);

    expect(trackerMock.markIdentityChangeIfNeeded).not.toHaveBeenCalled();
  });
});
