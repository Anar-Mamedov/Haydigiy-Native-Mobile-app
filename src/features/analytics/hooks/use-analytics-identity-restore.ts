import { useEffect } from 'react';
import { analytics } from '../services/analytics-dispatcher';
import { userToAnalyticsIdentity } from '../utils/analytics-identity';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Açılışta kalıcı oturumu analytics bağlamına yeniden bağlar.
 *
 * `identify` yalnızca `useAuthStore.login`/`setUser` içinden çağrılıyor; Zustand
 * `persist` oturumu MMKV'den geri yüklerken bu yolların ikisi de çalışmaz.
 * Bu hook olmadan, uygulamayı kapatıp açan giriş yapmış bir kullanıcının bütün
 * event'leri `user_id: null` ile düşer — Insider tarafındaki
 * `useInsiderIdentityRestore` ile aynı boşluk.
 */
export function useAnalyticsIdentityRestore(): void {
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const identity = userToAnalyticsIdentity(user);
    if (identity) analytics.identify(identity);
  }, []);
}
