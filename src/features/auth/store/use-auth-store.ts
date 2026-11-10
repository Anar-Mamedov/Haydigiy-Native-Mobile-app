import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { clearAccessToken, setAccessToken } from '@/lib/storage/secure-storage';
import {
  insiderTracker,
  type InsiderLoginMethod,
} from '@/features/insider/services/insider-tracker';
import { analytics } from '@/features/analytics/services/analytics-dispatcher';
import { userToAnalyticsIdentity } from '@/features/analytics/utils/analytics-identity';
import { logoutApi } from '@/services/auth.service';
import { User } from '@/types/auth.types';

export type LogoutOptions = {
  /**
   * `false`: token sunucuda zaten silindi (ör. hesap silme bütün token'ları siliyor),
   * `POST /auth/logout` atılmaz. Varsayılan: atılır.
   */
  revokeServerSession?: boolean;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  /** `method` yalnızca Insider `user_login` eventini zenginleştirir; oturum akışını etkilemez. */
  login: (token: string, user: User, method?: InsiderLoginMethod) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  setUser: (user: User | null) => void;
};

/**
 * Token'ı sunucuda siler; çıkıştan sonra kopyalanmış bir token kullanılamaz. Best-effort:
 * ağ hatası, zaman aşımı ya da 401 (token zaten geçersiz) çıkışı engellemez, yerel temizlik
 * her durumda yapılır. Çevrimdışı kullanıcı da çıkış yapabilmelidir.
 */
async function revokeServerSession(): Promise<void> {
  try {
    await logoutApi();
  } catch (error) {
    if (__DEV__) console.warn('Sunucudaki oturum kapatılamadı, yalnızca cihazdan çıkış yapıldı.', error);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      login: async (token, user, method) => {
        set({ isLoading: true });
        try {
          await setAccessToken(token);
          set({ user, isLoading: false });
          // Insider: oturum açan kullanıcıyı attribute + identifier'larla tanıt.
          insiderTracker.identifyUser(user);
          // Sıra önemli: event kimlik tanıtıldıktan sonra doğru profile yazılır.
          insiderTracker.trackUserLogin(method);

          // Aynı sıra analytics tarafında da geçerli: kimlik önce bağlanır ki
          // giriş eventi ve sonrasındaki her event `user_id` ile ilişkilensin.
          const identity = userToAnalyticsIdentity(user);
          if (identity) analytics.identify(identity);
          analytics.track({ name: 'user_logged_in', method });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async (options) => {
        set({ isLoading: true });
        try {
          // Sıra önemli: istek token'ı SecureStore'dan okur, token silinmeden önce gitmeli.
          if (options?.revokeServerSession !== false) {
            await revokeServerSession();
          }
          await clearAccessToken();
          set({ user: null, isLoading: false });
          // Sıra önemli: event önce gider, kullanıcı sonra anonimleşir.
          insiderTracker.trackUserLogout('user');
          insiderTracker.clearUser();

          analytics.track({ name: 'user_logged_out', reason: 'user' });
          analytics.reset();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      setUser: (user) => {
        const previousUser = get().user;
        set({ user });
        // Profil güncellemeleri Insider attribute'larını tazeler; süresi dolan
        // oturumun düşmesi (null) Insider tarafında da logout sayılır.
        if (user) {
          // Kimlik (e-posta/telefon) buradan BİLDİRİLMEZ. `setUser` profil kaydedildiği
          // anda çalışır; yeni identifier'ı cihazdan göndermek backend'in Update
          // Identifiers isteğiyle yarışır ve genelde onu geçer — Insider yeni değeri ilk
          // kez gördüğü için ikinci bir profil açar ve kullanıcının geçmişi eski profilde
          // kalır. Identifier'ı backend değiştirir. Değişiklik bekleme penceresini açar:
          // uygulama bu sürede yeniden açılsa ya da kullanıcı tekrar giriş yapsa da
          // `identifyUser` yeni değeri göndermez, pencere kapandıktan sonra gönderir.
          insiderTracker.markIdentityChangeIfNeeded(previousUser, user);
          insiderTracker.refreshUserAttributes(user);

          const identity = userToAnalyticsIdentity(user);
          if (identity) analytics.identify(identity);
        } else {
          // Kullanıcı eylemi değil, token'ın geçersiz kalması; kampanyalarda ayrışsın.
          insiderTracker.trackUserLogout('session_expired');
          insiderTracker.clearUser();

          analytics.track({ name: 'user_logged_out', reason: 'session_expired' });
          analytics.reset();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
