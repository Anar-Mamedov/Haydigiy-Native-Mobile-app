import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

/**
 * Keeps the Android system navigation bar buttons readable in both app themes.
 * Without this they follow the device theme, so a dark-mode device shows white
 * back/home/recents buttons over the light app. `NavigationBarStyle` names the
 * bar, not its content — a `light` bar has dark buttons — so the app theme maps
 * to the style directly. Requires the `expo-navigation-bar` plugin with
 * `enforceContrast: false`; only three-button navigation is affected (the
 * gesture pill adapts on its own).
 */
export function useAndroidNavigationBarStyle(resolvedTheme: 'light' | 'dark') {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    NavigationBar.setStyle(resolvedTheme);
  }, [resolvedTheme]);
}
