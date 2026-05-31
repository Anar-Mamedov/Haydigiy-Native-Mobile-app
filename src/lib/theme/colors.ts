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
