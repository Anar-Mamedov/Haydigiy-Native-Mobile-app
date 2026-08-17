import { useEffect } from 'react';
import { insiderTracker } from '../services/insider-tracker';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Uygulama açılışında kalıcı oturumu Insider'a yeniden tanıtır.
 *
 * `identifyUser` yalnızca `useAuthStore.login` ve `setUser` içinden çağrılır.
 * Zustand `persist` oturumu MMKV'den geri yüklerken bu yolların ikisi de
 * çalışmaz, dolayısıyla kimlik tamamen native SDK'nın kendi kalıcı kaydına
 * bağlı kalır. O kayıt sıfırlandığında (yeniden kurulum, uygulama verisinin
 * temizlenmesi, `logout()` tetikleyen geçici bir token okuma hatası) oturum
 * sessizce anonim devam eder ve satın alma dahil tüm eventler anonim profile
 * düşer; kendini toparlayacak bir yol yoktur.
 *
 * Bu hook o boşluğu kapatır: açılışta bir kez kimliği yeniden bildirir.
 * `identifyUser` idempotent olduğu için SDK zaten doğru kullanıcıyı tanıyorsa
 * çağrı zararsızdır.
 */
export function useInsiderIdentityRestore(): void {
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) insiderTracker.identifyUser(user);
  }, []);
}
