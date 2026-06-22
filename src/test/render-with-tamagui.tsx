import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui, TamaguiProvider, Theme } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BRAND_COLOR } from '@/lib/theme/colors';

const testConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, brand: BRAND_COLOR },
    dark: { ...defaultConfig.themes.dark, brand: BRAND_COLOR },
  },
});

type ThemeName = 'light' | 'dark';

function makeWrapper(themeName: ThemeName) {
  return function Wrapper({ children }: PropsWithChildren) {
    // Fresh client per render so query/mutation state never leaks between tests;
    // retries off so failures surface immediately instead of hanging.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={testConfig} defaultTheme={themeName}>
          <Theme name={themeName}>{children}</Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    );
  };
}

export function renderWithTamagui(component: ReactElement, theme: ThemeName = 'light') {
  return render(component, {
    wrapper: makeWrapper(theme),
  });
}
