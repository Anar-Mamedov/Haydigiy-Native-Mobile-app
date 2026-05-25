import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui, TamaguiProvider, Theme } from 'tamagui';
import { BRAND_COLOR } from '@/lib/theme/colors';

const testConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, brand: BRAND_COLOR },
    dark: { ...defaultConfig.themes.dark, brand: BRAND_COLOR },
  },
});

function Wrapper({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider config={testConfig} defaultTheme="light">
      <Theme name="light">{children}</Theme>
    </TamaguiProvider>
  );
}

export function renderWithTamagui(component: ReactElement) {
  return render(component, {
    wrapper: Wrapper,
  });
}
