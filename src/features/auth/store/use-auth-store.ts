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
import { User } from '@/types/auth.types';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  /** `method` yalnızca Insider `user_login` eventini zenginleştirir; oturum akışını etkilemez. */
  login: (token: string, user: User, method?: InsiderLoginMethod) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      logout: async () => {
        set({ isLoading: true });
        try {
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
        set({ user });
        // Profil güncellemeleri Insider attribute'larını tazeler; süresi dolan
        // oturumun düşmesi (null) Insider tarafında da logout sayılır.
        if (user) {
          insiderTracker.identifyUser(user);

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
