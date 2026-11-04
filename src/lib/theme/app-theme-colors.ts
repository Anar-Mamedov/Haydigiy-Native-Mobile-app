import {
  ASSISTANT_ACCENT_COLOR,
  ASSISTANT_ACCENT_TINT_BORDER_COLOR,
  ASSISTANT_ACCENT_TINT_BORDER_COLOR_DARK,
  ASSISTANT_ACCENT_TINT_COLOR,
  ASSISTANT_ACCENT_TINT_COLOR_DARK,
  ASSISTANT_LIVE_SUPPORT_COLOR,
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
} from './colors';

/**
 * Uygulamanın Tamagui varsayılan temalarına eklediği renkler. `tamagui.config.ts` ve test
 * sarmalayıcısı (`src/test/render-with-tamagui.tsx`) aynı nesneyi kullanır; böylece testlerdeki
 * tema, uygulamadakinden ayrışamaz.
 */
export const APP_LIGHT_THEME_COLORS = {
  brand: BRAND_COLOR,
  discount: DISCOUNT_COLOR,
  discountBackground: DISCOUNT_BACKGROUND_COLOR,
  discountBadge: DISCOUNT_COLOR,
  savingsBadge: SAVINGS_BADGE_COLOR,
  singlePrice: SINGLE_PRICE_COLOR,
  overlay: SHEET_OVERLAY_COLOR,
  brandTintText: BRAND_TINT_TEXT_COLOR,
  assistantAccent: ASSISTANT_ACCENT_COLOR,
  assistantAccentTint: ASSISTANT_ACCENT_TINT_COLOR,
  assistantAccentTintBorder: ASSISTANT_ACCENT_TINT_BORDER_COLOR,
  assistantLiveSupport: ASSISTANT_LIVE_SUPPORT_COLOR,
} as const;

export const APP_DARK_THEME_COLORS = {
  brand: BRAND_COLOR,
  discount: DISCOUNT_COLOR_DARK,
  discountBackground: DISCOUNT_BACKGROUND_COLOR_DARK,
  discountBadge: DISCOUNT_COLOR,
  savingsBadge: SAVINGS_BADGE_COLOR,
  singlePrice: SINGLE_PRICE_COLOR_DARK,
  overlay: SHEET_OVERLAY_COLOR,
  brandTintText: BRAND_TINT_TEXT_COLOR_DARK,
  assistantAccent: ASSISTANT_ACCENT_COLOR,
  assistantAccentTint: ASSISTANT_ACCENT_TINT_COLOR_DARK,
  assistantAccentTintBorder: ASSISTANT_ACCENT_TINT_BORDER_COLOR_DARK,
  assistantLiveSupport: ASSISTANT_LIVE_SUPPORT_COLOR,
} as const satisfies Record<keyof typeof APP_LIGHT_THEME_COLORS, string>;
