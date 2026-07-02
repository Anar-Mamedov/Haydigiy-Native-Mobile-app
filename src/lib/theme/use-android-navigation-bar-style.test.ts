import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { setStyle } from 'expo-navigation-bar';
import { useAndroidNavigationBarStyle } from './use-android-navigation-bar-style';

jest.mock('expo-navigation-bar', () => ({
  setStyle: jest.fn(),
}));

describe('useAndroidNavigationBarStyle', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    jest.clearAllMocks();
  });

  it('matches the navigation bar style to the app theme on Android', () => {
    Platform.OS = 'android';

    const { rerender } = renderHook(
      ({ theme }: { theme: 'light' | 'dark' }) => useAndroidNavigationBarStyle(theme),
      { initialProps: { theme: 'light' as 'light' | 'dark' } },
    );

    // 'light' bar = dark buttons, readable over the light theme.
    expect(setStyle).toHaveBeenCalledWith('light');

    rerender({ theme: 'dark' });

    expect(setStyle).toHaveBeenCalledWith('dark');
  });

  it('does nothing on iOS', () => {
    Platform.OS = 'ios';

    renderHook(() => useAndroidNavigationBarStyle('light'));

    expect(setStyle).not.toHaveBeenCalled();
  });
});
