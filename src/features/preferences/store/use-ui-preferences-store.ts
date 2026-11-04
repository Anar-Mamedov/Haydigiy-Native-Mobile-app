import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ThemePreference } from '@/components/ui/theme-toggle';
import { zustandStorage } from '@/lib/storage/zustand-storage';

type UiPreferencesState = {
  setThemePreference: (themePreference: ThemePreference) => void;
  themePreference: ThemePreference;
};

/**
 * 1: tema seçici gizlendi (koyu mod kaldırıldı, `9cbee42`). Seçicinin göründüğü dönemde kaydedilmiş
 * `dark` / `system` tercihi kullanıcı tarafından artık değiştirilemeyeceği için açık temaya sıfırlanır.
 */
export const UI_PREFERENCES_STORE_VERSION = 1;

/** Zustand yalnız kayıtlı sürüm güncelden farklıyken çağırır; o kayıtların tercihi açık temaya döner. */
export function migrateUiPreferences(persisted: unknown): Pick<UiPreferencesState, 'themePreference'> {
  const stored = persisted && typeof persisted === 'object' ? persisted : {};
  return { ...stored, themePreference: 'light' };
}

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
      version: UI_PREFERENCES_STORE_VERSION,
      migrate: migrateUiPreferences,
    },
  ),
);
