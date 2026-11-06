/**
 * Arama sorgusunu ürün listesi başlığına çevirir. Web'deki
 * `titleUtils.formatSearchResultsHeading` ile aynı sonucu verir:
 *   "ışıklı pijama"        → "Işıklı Pijama" için sonuçlar
 *   "  kız çocuk_pijama  " → "Kız Çocuk Pijama" için sonuçlar
 *
 * Web sorguyu bir kez daha `decodeURIComponent` ile çözer; burada çözülmez.
 * Expo Router rota parametrelerini zaten çözülmüş verir ve ikinci çözme
 * "%50 indirim" gibi gerçek aramaları "P indirim"e çevirirdi.
 *
 * Türkçe büyük/küçük harf dönüşümü `turkish-case.ts`'te (i/İ, ı/I elle eşlenir).
 */

import { toTurkishTitleCase } from './turkish-case';

/** Arama terimini görüntülenecek biçime getirir; boşsa `undefined` döner. */
export function formatSearchTerm(searchTerm?: string | null): string | undefined {
  if (!searchTerm?.trim()) return undefined;

  const normalized = searchTerm
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return undefined;

  return toTurkishTitleCase(normalized);
}

/** Arama sonuç listesinin başlığı: `"Işıklı Pijama" için sonuçlar`. */
export function formatSearchResultsHeading(searchTerm?: string | null): string | undefined {
  const displayTerm = formatSearchTerm(searchTerm);
  return displayTerm ? `"${displayTerm}" için sonuçlar` : undefined;
}
