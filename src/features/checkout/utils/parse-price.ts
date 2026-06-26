/**
 * Parses a price that may arrive in Turkish (`1.234,56`) or English (`1234.56`)
 * format into a number. Ported from the web `MobilePayment.parsePrice` so cargo
 * prices, coupon discounts and backend totals are interpreted identically.
 */
export function parsePrice(price: string | number | null | undefined): number {
  if (price === null || price === undefined || price === '') return 0;
  if (typeof price === 'number') return Number.isFinite(price) ? price : 0;

  let priceStr = price.toString().trim().replace(/\s/g, '');

  const hasComma = priceStr.includes(',');
  const hasDot = priceStr.includes('.');

  if (hasComma && hasDot) {
    // Turkish thousands + decimal: 1.234,56 → 1234.56
    priceStr = priceStr.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    // Decimal comma only: 1234,56 → 1234.56
    priceStr = priceStr.replace(',', '.');
  } else if (!hasComma && hasDot) {
    // Multiple dots = Turkish thousands separators: 1.234.567 → 1234567
    const dotCount = (priceStr.match(/\./g) || []).length;
    if (dotCount > 1) {
      priceStr = priceStr.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(priceStr);
  return Number.isNaN(parsed) ? 0 : parsed;
}
