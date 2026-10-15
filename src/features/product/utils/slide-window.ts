/**
 * Döngüsel bir slider'da `index` slaydının görselinin mount edilip edilmeyeceği.
 *
 * Yalnızca etkin slayt ve iki yanındaki `radius` kadar komşu görsel yükler; böylece bir sonraki
 * (ya da önceki) slayt kaydırmaya hazırdır, geri kalan slaytlar bitmap tutmaz. Uzaklık döngüsel
 * ölçülür: son slayttayken ilk slayt da komşudur, çünkü otomatik oynatma oraya döner.
 */
export function isSlideInWindow(index: number, activeIndex: number, count: number, radius = 1): boolean {
  if (count <= 0 || index < 0 || index >= count) return false;

  const distance = Math.abs(index - activeIndex);
  return Math.min(distance, count - distance) <= radius;
}
