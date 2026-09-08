export function formatCurrency(amount: number, currency: 'TRY' = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
}

/**
 * Para birimi simgesi olmadan tr-TR biçiminde tutar. Birim metnin tutardan
 * ayrıldığı yerler içindir (örneğin "0/2.000 TL"), `formatCurrency` orada
 * simgeyi her parçaya tekrar basacağı için kullanılamaz.
 */
export function formatAmount(amount: number) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(safeAmount);
}
