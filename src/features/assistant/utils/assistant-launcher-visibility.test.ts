import { isAssistantLauncherHiddenPath } from './assistant-launcher-visibility';

describe('isAssistantLauncherHiddenPath', () => {
  it.each([
    '/',
    '/categories',
    '/kategori/kadin-elbise',
    '/s/ABC',
    '/favorites',
    '/profile',
    '/orders',
    '/order/100001',
    '/help',
    '/addresses',
    '/coupons',
    '/gezdiklerim',
    '/(tabs)/categories',
  ])('sekme ekranlarında görünür: %s', (pathname) => {
    expect(isAssistantLauncherHiddenPath(pathname)).toBe(false);
  });

  it.each([
    '/assistant',
    '/cart',
    '/checkout',
    '/checkout/payment-success',
    '/order-cancel/100001',
    '/return-create/100001',
    '/product-questions',
    '/product-reviews',
    '/address-form',
    '/payment-method-form',
    '/bank-account',
    '/user-info',
    '/change-password',
    '/feedback',
    '/(tabs)/cart',
  ])('sohbet, sepet/ödeme, iptal/iade, alt çubuklu ve form ekranlarında gizlenir: %s', (pathname) => {
    expect(isAssistantLauncherHiddenPath(pathname)).toBe(true);
  });

  it('yalnız tam yol parçası eşleşir: "/cartography" "/cart" ile, "/feedbacks" "/feedback" ile karışmaz', () => {
    expect(isAssistantLauncherHiddenPath('/cartography')).toBe(false);
    expect(isAssistantLauncherHiddenPath('/feedbacks')).toBe(false);
  });
});
