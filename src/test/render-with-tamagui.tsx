import { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui, TamaguiProvider, Theme } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ASSISTANT_LINK_BUTTON_COLOR,
  ASSISTANT_LIVE_SUPPORT_COLOR,
  ASSISTANT_USER_BUBBLE_BORDER_COLOR,
  ASSISTANT_USER_BUBBLE_BORDER_COLOR_DARK,
  ASSISTANT_USER_BUBBLE_COLOR,
  ASSISTANT_USER_BUBBLE_COLOR_DARK,
  BRAND_COLOR,
  BRAND_TINT_TEXT_COLOR,
  BRAND_TINT_TEXT_COLOR_DARK,
  DISCOUNT_BACKGROUND_COLOR,
  DISCOUNT_BACKGROUND_COLOR_DARK,
  DISCOUNT_COLOR,
  DISCOUNT_COLOR_DARK,
  SAVINGS_BADGE_COLOR,
  SHEET_OVERLAY_COLOR,
  SINGLE_PRICE_COLOR,
  SINGLE_PRICE_COLOR_DARK,
} from '@/lib/theme/colors';
import { FONT_SCALE_DEFAULT_PROPS } from '@/lib/theme/font-scale';

const testConfig = createTamagui({
  ...defaultConfig,
  // Uygulama config'iyle aynı yazı boyutu tavanı; testler gerçek davranışı görsün.
  defaultProps: FONT_SCALE_DEFAULT_PROPS,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      brand: BRAND_COLOR,
      discount: DISCOUNT_COLOR,
      discountBackground: DISCOUNT_BACKGROUND_COLOR,
      discountBadge: DISCOUNT_COLOR,
      savingsBadge: SAVINGS_BADGE_COLOR,
      singlePrice: SINGLE_PRICE_COLOR,
      overlay: SHEET_OVERLAY_COLOR,
      brandTintText: BRAND_TINT_TEXT_COLOR,
      assistantUserBubble: ASSISTANT_USER_BUBBLE_COLOR,
      assistantUserBubbleBorder: ASSISTANT_USER_BUBBLE_BORDER_COLOR,
      assistantLinkButton: ASSISTANT_LINK_BUTTON_COLOR,
      assistantLiveSupport: ASSISTANT_LIVE_SUPPORT_COLOR,
    },
    dark: {
      ...defaultConfig.themes.dark,
      brand: BRAND_COLOR,
      discount: DISCOUNT_COLOR_DARK,
      discountBackground: DISCOUNT_BACKGROUND_COLOR_DARK,
      discountBadge: DISCOUNT_COLOR,
      savingsBadge: SAVINGS_BADGE_COLOR,
      singlePrice: SINGLE_PRICE_COLOR_DARK,
      overlay: SHEET_OVERLAY_COLOR,
      brandTintText: BRAND_TINT_TEXT_COLOR_DARK,
      assistantUserBubble: ASSISTANT_USER_BUBBLE_COLOR_DARK,
      assistantUserBubbleBorder: ASSISTANT_USER_BUBBLE_BORDER_COLOR_DARK,
      assistantLinkButton: ASSISTANT_LINK_BUTTON_COLOR,
      assistantLiveSupport: ASSISTANT_LIVE_SUPPORT_COLOR,
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
