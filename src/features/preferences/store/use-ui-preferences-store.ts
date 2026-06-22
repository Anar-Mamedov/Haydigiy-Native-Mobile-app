import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ThemePreference } from '@/components/ui/theme-toggle';
import { zustandStorage } from '@/lib/storage/zustand-storage';

type UiPreferencesState = {
  setThemePreference: (themePreference: ThemePreference) => void;
  themePreference: ThemePreference;
};

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      setThemePreference: (themePreference) => {
        set({ themePreference });
      },
      // Default to light mode until the user explicitly picks another preference.
      themePreference: 'light',
    }),
    {
      name: 'ui-preferences-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
