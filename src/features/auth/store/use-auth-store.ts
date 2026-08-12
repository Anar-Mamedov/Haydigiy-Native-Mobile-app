import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { clearAccessToken, setAccessToken } from '@/lib/storage/secure-storage';
import {
  insiderTracker,
  type InsiderLoginMethod,
} from '@/features/insider/services/insider-tracker';
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
        } else {
          // Kullanıcı eylemi değil, token'ın geçersiz kalması; kampanyalarda ayrışsın.
          insiderTracker.trackUserLogout('session_expired');
          insiderTracker.clearUser();
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
