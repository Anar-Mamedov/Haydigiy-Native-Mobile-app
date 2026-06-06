import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { clearAccessToken, setAccessToken } from '@/lib/storage/secure-storage';
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
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
