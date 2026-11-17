import { renderHook } from '@testing-library/react-native';
import { Appearance } from 'react-native';
import type { ThemePreference } from '@/components/ui/theme-toggle';
import { toNativeColorScheme, useNativeColorScheme } from './use-native-color-scheme';

describe('toNativeColorScheme', () => {
  it('pins the native layer to an explicit app theme', () => {
    expect(toNativeColorScheme('light')).toBe('light');
    expect(toNativeColorScheme('dark')).toBe('dark');
  });

  it('lets the native layer follow the phone only for the system preference', () => {
    expect(toNativeColorScheme('system')).toBe('unspecified');
  });
});

// HMA-65: telefon koyu moddayken native katman da koyuya geçiyordu; açık temadaki uygulamada
// metin alanlarının native varsayılan yazı/placeholder rengi beyaz kalıyordu.
describe('useNativeColorScheme', () => {
  const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined);

  afterEach(() => {
    setColorScheme.mockClear();
  });

  afterAll(() => {
    setColorScheme.mockRestore();
  });

  it('pins the native color scheme to the app theme preference and follows its changes', () => {
    const { rerender } = renderHook(({ preference }: { preference: ThemePreference }) => useNativeColorScheme(preference), {
      initialProps: { preference: 'light' as ThemePreference },
    });

    expect(setColorScheme).toHaveBeenLastCalledWith('light');

    rerender({ preference: 'system' });

    expect(setColorScheme).toHaveBeenLastCalledWith('unspecified');
  });

  it('does not re-apply the scheme while the preference stays the same', () => {
    const { rerender } = renderHook(({ preference }: { preference: ThemePreference }) => useNativeColorScheme(preference), {
      initialProps: { preference: 'light' as ThemePreference },
    });

    rerender({ preference: 'light' });

    expect(setColorScheme).toHaveBeenCalledTimes(1);
  });
});
