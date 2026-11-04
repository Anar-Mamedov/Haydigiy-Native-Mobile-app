import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui, TamaguiProvider, Theme } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { APP_DARK_THEME_COLORS, APP_LIGHT_THEME_COLORS } from '@/lib/theme/app-theme-colors';
import { FONT_SCALE_DEFAULT_PROPS } from '@/lib/theme/font-scale';

const testConfig = createTamagui({
  ...defaultConfig,
  // Uygulama config'iyle aynı yazı boyutu tavanı; testler gerçek davranışı görsün.
  defaultProps: FONT_SCALE_DEFAULT_PROPS,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...APP_LIGHT_THEME_COLORS,
    },
    dark: {
      ...defaultConfig.themes.dark,
      ...APP_DARK_THEME_COLORS,
    },
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
