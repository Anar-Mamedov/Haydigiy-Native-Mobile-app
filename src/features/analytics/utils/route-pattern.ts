/**
 * Expo Router segmentlerinden ekranın rota kalıbını üretir:
 * `['(tabs)', 'product', '[id]']` → `/product/[id]`.
 *
 * Grup segmentleri (`(tabs)`) URL'nin parçası değildir ve düşer; dinamik
 * segmentler (`[id]`, `[...slug]`) açılmadan kalır. Böylece aynı ekranın her
 * ürünü tek bir ekran adıyla raporlanır.
 */
export function toRoutePattern(segments: readonly string[]): string {
  const visible = segments.filter((segment) => !/^\(.*\)$/.test(segment));
  return `/${visible.join('/')}`;
}
