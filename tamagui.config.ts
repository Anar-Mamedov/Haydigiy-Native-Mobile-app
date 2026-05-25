import { defaultConfig } from '@tamagui/config/v5';
import { animations } from '@tamagui/config/v5-reanimated';
import { createTamagui } from 'tamagui';
import { BRAND_COLOR } from './src/lib/theme/colors';

export const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, brand: BRAND_COLOR },
    dark: { ...defaultConfig.themes.dark, brand: BRAND_COLOR },
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
  animations,
});

export type OurConfig = typeof config;

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends OurConfig {}
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends OurConfig {}
}

declare module 'tamagui' {
  interface TamaguiCustomConfig extends OurConfig {}
}

export default config;
