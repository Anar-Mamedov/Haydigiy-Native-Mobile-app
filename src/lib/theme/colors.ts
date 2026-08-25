/**
 * Brand accent color. Prefer the Tamagui `$brand` theme token in Tamagui component
 * props; use this constant only in plain React Native style objects and non-Tamagui
 * APIs (RefreshControl, navigation options, SVG fills) where theme tokens don't resolve.
 */
export const BRAND_COLOR = '#f27a1a';

/**
 * Semantic accent colors. Same usage rule as {@link BRAND_COLOR}: prefer Tamagui
 * tokens (e.g. `$red10`, `$yellow10`) in Tamagui props, and use these constants only
 * for non-Tamagui APIs and SVG `fill` props where theme tokens do not resolve.
 */
export const DANGER_COLOR = '#ef4444';
export const WARNING_COLOR = '#f59e0b';

/**
 * Two-stop brand gradient for the promotional "secure payment" badge. A gradient
 * has no single Tamagui token, so its stops are centralized here (consumed via
 * expo-linear-gradient) instead of being hard-coded at the call site.
 */
export const BRAND_GRADIENT = ['#ff6c15', '#fe4c7f'] as const;

/**
 * Sıralama rozetinin ("En çok satan 3. ürün") üç duraklı arka plan gradyanı.
 * Bir gradyanın tek bir Tamagui token'ı olmadığı için durakları burada
 * merkezileştirildi; expo-linear-gradient ile tüketilir.
 */
export const RANKING_BADGE_GRADIENT = ['#f27a1a', '#f79a0f', '#ffbf00'] as const;

/**
 * Checkout payment description badge color, used for texts such as
 * "Peşin fiyatına 3 taksit" under the secure payment badge.
 */
export const PAYMENT_DESCRIPTION_BADGE_COLOR = '#18b85f';

/**
 * Dim scrim shown behind expandable panels/overlays (e.g. the checkout summary).
 * A scrim is a fixed semi-transparent black in both light and dark themes, so it
 * has no theme token; centralized here instead of being hard-coded per overlay.
 */
export const SCRIM_COLOR = 'rgba(0, 0, 0, 0.18)';

/**
 * Backdrop behind bottom sheets. Exposed as the `$overlay` theme color in
 * `tamagui.config.ts`; in Tamagui props prefer `$overlay` (via `AppSheetOverlay`)
 * and use this constant only where theme tokens do not resolve.
 */
export const SHEET_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';
