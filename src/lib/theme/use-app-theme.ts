import { useColorScheme } from 'react-native';
import { useUiPreferencesStore } from '@/features/preferences/store/use-ui-preferences-store';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const themePreference = useUiPreferencesStore((state) => state.themePreference);
  const setThemePreference = useUiPreferencesStore((state) => state.setThemePreference);

  const resolvedTheme =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  return {
    resolvedTheme,
    setThemePreference,
    themePreference,
  };
}
