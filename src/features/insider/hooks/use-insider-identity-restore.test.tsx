import { renderHook } from '@testing-library/react-native';
import { useInsiderIdentityRestore } from './use-insider-identity-restore';
import { insiderTracker } from '../services/insider-tracker';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { User } from '@/types/auth.types';

jest.mock('../services/insider-tracker', () => ({
  insiderTracker: { identifyUser: jest.fn(), applyDefaultLocale: jest.fn() },
}));

const identifyUser = insiderTracker.identifyUser as jest.Mock;
const applyDefaultLocale = insiderTracker.applyDefaultLocale as jest.Mock;

const storedUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Ayşe',
  surname: 'Yılmaz',
  phoneNumber: '5321234567',
};

describe('useInsiderIdentityRestore', () => {
  beforeEach(() => {
    identifyUser.mockClear();
    applyDefaultLocale.mockClear();
    useAuthStore.setState({ user: null });
  });

  // Regresyon: `persist` oturumu MMKV'den geri yüklerken `login`/`setUser`
  // çalışmadığı için Insider kimliği hiç tazelenmiyordu; SDK'nın kendi kaydı
  // sıfırlandığında oturum anonim devam ediyor ve satın alma eventi
  // kullanıcının profiline düşmüyordu.
  it('re-identifies the restored session once on mount', () => {
    useAuthStore.setState({ user: storedUser });

    const { rerender } = renderHook(() => useInsiderIdentityRestore());
    rerender(undefined);

    expect(identifyUser).toHaveBeenCalledTimes(1);
    expect(identifyUser).toHaveBeenCalledWith(storedUser);
  });

  // Misafirde kimlik bildirilmez ama dil/locale tanımlanır: Smart Recommender
  // öneri feed'ini locale ile eşleştiriyor ve bu attribute ön koşul.
  it('only sets the default locale for anonymous sessions', () => {
    renderHook(() => useInsiderIdentityRestore());

    expect(identifyUser).not.toHaveBeenCalled();
    expect(applyDefaultLocale).toHaveBeenCalledTimes(1);
  });

  it('does not re-apply the default locale when a session is restored', () => {
    useAuthStore.setState({ user: storedUser });

    renderHook(() => useInsiderIdentityRestore());

    // `identifyUser` dil/locale'i zaten yazıyor; ikinci çağrı gereksiz.
    expect(applyDefaultLocale).not.toHaveBeenCalled();
  });
});
