import { useEffect } from 'react';
import { insiderTracker } from '../services/insider-tracker';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * Uygulama açılışında kalıcı oturumu Insider'a yeniden tanıtır.
 *
 * `identifyUser` bunun dışında yalnızca `useAuthStore.login` içinden çağrılır.
 * Zustand `persist` oturumu MMKV'den geri yüklerken o yol çalışmaz, dolayısıyla
 * kimlik tamamen native SDK'nın kendi kalıcı kaydına bağlı kalır. O kayıt sıfırlandığında (yeniden kurulum, uygulama verisinin
 * temizlenmesi, `logout()` tetikleyen geçici bir token okuma hatası) oturum
 * sessizce anonim devam eder ve satın alma dahil tüm eventler anonim profile
 * düşer; kendini toparlayacak bir yol yoktur.
 *
 * Bu hook o boşluğu kapatır: açılışta bir kez kimliği yeniden bildirir.
 * `identifyUser` idempotent olduğu için SDK zaten doğru kullanıcıyı tanıyorsa
 * çağrı zararsızdır.
 *
 * Aynı zamanda e-posta/telefon değişikliğinin cihaza yansıdığı noktadır: profil
 * güncellemesi kimliği bilerek göndermez (bkz.
 * `InsiderTracker.refreshUserAttributes`), çünkü identifier'ı backend Update
 * Identifiers API'si ile değiştirir. Açılış o değişiklikten saniyeler sonra da
 * gelebilir (sistem uygulamayı arka planda kapatabilir); bu yüzden `identifyUser`,
 * backend'in bekleme penceresi kapanana kadar yeni değeri geri tutar (bkz.
 * `InsiderIdentityChangeGate`), aksi halde yeni değer duplike profil açardı.
 */
export function useInsiderIdentityRestore(): void {
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) {
      insiderTracker.identifyUser(user);
      return;
    }

    // Misafir ziyaretçi: `identifyUser` hiç çalışmaz, dolayısıyla dil/locale attribute'u
    // tanımsız kalırdı. Smart Recommender bu alanı ön koşul sayıyor (öneri feed'i locale
    // ile eşleşiyor), bu yüzden oturum olmadan da tanımlanır.
    insiderTracker.applyDefaultLocale();
  }, []);
}
