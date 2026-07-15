import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { TamaguiProvider, Theme } from 'tamagui';
import { queryClient } from '@/lib/query-client';
import { useAndroidNavigationBarStyle } from '@/lib/theme/use-android-navigation-bar-style';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import config from '../../../tamagui.config';

export function AppProviders({ children }: PropsWithChildren) {
  const { resolvedTheme } = useAppTheme();
  useAndroidNavigationBarStyle(resolvedTheme);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
        <KeyboardProvider>
          <Theme name={resolvedTheme}>
            <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
            {children}
          </Theme>
        </KeyboardProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
