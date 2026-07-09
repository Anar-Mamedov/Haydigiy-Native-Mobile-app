const EDGE_SWIPE_BACK_PATHS = [
  '/address-form',
  '/addresses',
  '/agreements',
  '/bank-account',
  '/change-password',
  '/checkout/payment-failed',
  '/checkout/payment-success',
  '/coupons',
  '/gezdiklerim',
  '/help',
  '/order',
  '/order-cancel',
  '/orders',
  '/payment-method-form',
  '/payment-methods',
  '/product-questions',
  '/product-reviews',
  '/return-create',
  '/reviews',
  '/user-info',
] as const;

export function isIosEdgeSwipeBackPath(pathname: string) {
  const normalizedPathname = pathname.replace(/^\/\(tabs\)/, '') || '/';

  return EDGE_SWIPE_BACK_PATHS.some(
    (path) => normalizedPathname === path || normalizedPathname.startsWith(`${path}/`),
  );
}
