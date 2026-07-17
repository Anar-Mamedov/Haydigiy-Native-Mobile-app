/**
 * Identifies checkout errors that mean the displayed amount is no longer
 * current. These errors require a fresh cart snapshot before retrying payment.
 */
export function isCheckoutPriceChangeMessage(message: string): boolean {
  const normalizedMessage = message.toLocaleLowerCase('tr-TR');

  return (
    normalizedMessage.includes('sipariş tutarı güncellendi') ||
    normalizedMessage.includes('kupon tutarı güncellendi') ||
    (normalizedMessage.includes('geçersiz ödeme tutarı') &&
      normalizedMessage.includes('ürün bedelinden düşük'))
  );
}
