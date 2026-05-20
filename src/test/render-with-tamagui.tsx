import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui, TamaguiProvider, Theme } from 'tamagui';

const testConfig = createTamagui(defaultConfig);

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
