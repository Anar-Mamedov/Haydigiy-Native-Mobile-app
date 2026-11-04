/**
 * Sağ-alt "Haydi Asistan" düğmesinin çizilmediği ekranlar (yol önekleri); geri kalan her sekme
 * ekranında görünür. Webdeki dışlama listesinin (frontend `src/lib/assistant/assistantRoutes.ts`)
 * uygulama karşılığı: sohbetin kendisi, sepet ve ödeme, sipariş iptal/iade akışları ve form ekranları
 * (klavye açıkken düğme alanların ve kaydet düğmesinin üstüne binmesin). Ürün soru/yorum ekranlarının
 * altında sabit "Sepete Ekle" çubuğu durur; ürün detayı gibi orada da çizilmez.
 */
const HIDDEN_ON_PATH_PREFIXES: readonly string[] = [
  '/assistant',
  '/cart',
  '/checkout',
  '/order-cancel',
  '/return-create',
  '/product-questions',
  '/product-reviews',
  '/address-form',
  '/payment-method-form',
  '/bank-account',
  '/user-info',
  '/change-password',
  '/feedback',
];

const normalizePathname = (pathname: string) => pathname.replace(/^\/\(tabs\)/, '') || '/';

export function isAssistantLauncherHiddenPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return HIDDEN_ON_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
