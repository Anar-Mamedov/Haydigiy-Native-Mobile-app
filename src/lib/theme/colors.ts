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
 * İndirimli fiyat vurgusu. Açık temada web ile birebir aynı yeşil kullanılır; koyu
 * temada aynı ton yeterli kontrast vermediği için daha açık bir yeşile geçilir.
 * Bu iki değer `tamagui.config.ts` içinde `$discount` teması olarak tanımlanır, bu
 * yüzden Tamagui prop'larında `$discount` tercih edilmeli; buradaki sabitler yalnızca
 * token çözümlemeyen API'ler (SVG fill, RefreshControl vb.) içindir.
 */
export const DISCOUNT_COLOR = '#008040';
export const DISCOUNT_COLOR_DARK = '#2eb872';

/**
 * İndirim ve paket fiyat kartlarının hafif yeşil zemini. Koyu temada daha açık
 * vurgu rengi biraz daha yüksek alfa ile kullanılır; böylece kart zemini kaybolmaz.
 */
export const DISCOUNT_BACKGROUND_COLOR = 'rgba(0, 128, 64, 0.10)';
export const DISCOUNT_BACKGROUND_COLOR_DARK = 'rgba(46, 184, 114, 0.16)';

/**
 * İndirim oranı rozetinin ("-%20") kırmızı arka planı. Rozet kendi zeminini
 * taşıdığı ve üzerindeki metin her iki temada da beyaz kaldığı için tek bir
 * değerdir.
 */
export const DISCOUNT_RATE_BADGE_COLOR = '#cc0407';

/** Paket fiyat kartındaki "Pakette kazanç" rozetinin sabit zemini. */
export const SAVINGS_BADGE_COLOR = '#cc0407';

/**
 * WhatsApp marka yeşili. Marka rengi olduğu için temaya göre değişmez; yalnızca
 * WhatsApp destek aksiyonunda kullanılır.
 */
export const WHATSAPP_BRAND_COLOR = '#25D366';

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
