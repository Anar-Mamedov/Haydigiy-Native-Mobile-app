import { isCheckoutPriceChangeMessage } from './checkout-price-change';

describe('checkout price-change feedback', () => {
  it.each([
    'Sipariş tutarı güncellendi: 3009.91 TL.',
    'Kupon tutarı güncellendi. Lütfen güncel tutarı kontrol edin.',
    'Geçersiz ödeme tutarı. Taksitli tutar ürün bedelinden düşük olamaz.',
  ])('recognizes a retryable price warning: %s', (message) => {
    expect(isCheckoutPriceChangeMessage(message)).toBe(true);
  });

  it('does not mark unrelated payment failures as price changes', () => {
    expect(isCheckoutPriceChangeMessage('Kartınız banka tarafından reddedildi.')).toBe(false);
  });
});
