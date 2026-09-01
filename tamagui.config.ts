import { defaultConfig } from '@tamagui/config/v5';
import { createAnimations } from '@tamagui/animations-react-native';
import { createTamagui } from 'tamagui';
import {
  BRAND_COLOR,
  DISCOUNT_BACKGROUND_COLOR,
  DISCOUNT_BACKGROUND_COLOR_DARK,
  DISCOUNT_COLOR,
  DISCOUNT_COLOR_DARK,
  SAVINGS_BADGE_COLOR,
  SHEET_OVERLAY_COLOR,
} from './src/lib/theme/colors';

// Use Tamagui's React Native Animated driver instead of the Reanimated driver.
// With Reanimated 4 + RN 0.83 New Architecture, RN's dev render-logging
// (logComponentRender) serializes Reanimated's animated-style proxies and throws
// "trying to pass an animated style to a non-animated component", which cascades
// into "Should not already be working." renderer reentrancy. The RN Animated
// driver avoids Reanimated styles entirely while keeping the same preset names so
// every Tamagui component animation reference still resolves. (Reanimated stays
// installed for React Navigation / gesture-handler — only Tamagui's driver moves.)
const animations = createAnimations({
  '0ms': { type: 'timing', duration: 0 },
  '50ms': { type: 'timing', duration: 50 },
  '75ms': { type: 'timing', duration: 75 },
  '100ms': { type: 'timing', duration: 100 },
  '200ms': { type: 'timing', duration: 200 },
  '250ms': { type: 'timing', duration: 250 },
  '300ms': { type: 'timing', duration: 300 },
  '400ms': { type: 'timing', duration: 400 },
  '500ms': { type: 'timing', duration: 500 },
  superBouncy: { damping: 5, mass: 0.7, stiffness: 180 },
  bouncy: { damping: 9, mass: 0.9, stiffness: 120 },
  superLazy: { damping: 25, mass: 2, stiffness: 25 },
  medium: { damping: 16, stiffness: 90, mass: 0.8 },
  lazy: { damping: 18, mass: 0.2, stiffness: 10 },
  slowest: { damping: 15, stiffness: 10 },
  slow: { damping: 45, stiffness: 60 },
  quick: { damping: 25, mass: 1, stiffness: 550 },
  quickLessBouncy: { damping: 40, mass: 2, stiffness: 400 },
  quicker: { damping: 16, mass: 0.6, stiffness: 700 },
  quickerLessBouncy: { damping: 27, mass: 0.45, stiffness: 750 },
  quickest: { damping: 15, mass: 0.6, stiffness: 400 },
  quickestLessBouncy: { damping: 24, mass: 0.35, stiffness: 750 },
});

export const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      brand: BRAND_COLOR,
      discount: DISCOUNT_COLOR,
      discountBackground: DISCOUNT_BACKGROUND_COLOR,
      discountBadge: DISCOUNT_COLOR,
      savingsBadge: SAVINGS_BADGE_COLOR,
      overlay: SHEET_OVERLAY_COLOR,
    },
    dark: {
      ...defaultConfig.themes.dark,
      brand: BRAND_COLOR,
      discount: DISCOUNT_COLOR_DARK,
      discountBackground: DISCOUNT_BACKGROUND_COLOR_DARK,
      discountBadge: DISCOUNT_COLOR,
      savingsBadge: SAVINGS_BADGE_COLOR,
      overlay: SHEET_OVERLAY_COLOR,
    },
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
