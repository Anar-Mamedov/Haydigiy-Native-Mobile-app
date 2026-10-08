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
 * Türkçe büyük/küçük harf dönüşümü (i/İ, ı/I) elle yapılır: Hermes'te
 * `toLocaleUpperCase('tr-TR')` yerel ayarı her derlemede dikkate almıyor ve
 * "istanbul" → "Istanbul" gibi yanlış sonuç üretebiliyor. Kelime sınırı için
 * `\b` kullanılmaz; JS'te `\b` yalnızca ASCII harfleri tanır ve "ışıklı" gibi
 * kelimelerde ilk ASCII harfi ("k") büyütür. Boşlukla bölmek güvenlidir.
 */

/** Türkçe'ye özgü harfleri genel dönüşümden önce eşler. */
const TURKISH_LOWER: Record<string, string> = { I: 'ı', İ: 'i' };
const TURKISH_UPPER: Record<string, string> = { i: 'İ', ı: 'I' };

/** Metni Türkçe kurallarıyla küçük harfe çevirir ("IŞIK" → "ışık", "İPEK" → "ipek"). */
export function toTurkishLowerCase(value: string): string {
  return value.replace(/[Iİ]/g, (char) => TURKISH_LOWER[char]).toLowerCase();
}

/** Tek bir karakteri Türkçe kurallarıyla büyük harfe çevirir ("i" → "İ"). */
function toTurkishUpperChar(char: string): string {
  return TURKISH_UPPER[char] ?? char.toUpperCase();
}

/**
 * Her kelimenin ilk harfini büyütür, kalanını küçültür ("ışıklı PİJAMA" →
 * "Işıklı Pijama"). Ardışık boşluklar teke indirilir.
 */
export function toTurkishTitleCase(value: string): string {
  return toTurkishLowerCase(value)
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => {
      // Kod noktası bazında böl: vekil çiftli (emoji vb.) ilk karakter bölünmesin.
      const [first, ...rest] = Array.from(word);
      return toTurkishUpperChar(first) + rest.join('');
    })
    .join(' ');
}

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
