import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { clearAccessToken, setAccessToken } from '@/lib/storage/secure-storage';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { User } from '@/types/auth.types';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (token, user) => {
        set({ isLoading: true });
        try {
          await setAccessToken(token);
          set({ user, isLoading: false });
          // Insider: oturum açan kullanıcıyı attribute + identifier'larla tanıt.
          insiderTracker.identifyUser(user);
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
