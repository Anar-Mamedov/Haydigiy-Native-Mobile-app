export function formatCurrency(amount: number, currency: 'TRY' = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
}
