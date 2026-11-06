/**
 * Türkçe büyük/küçük harf dönüşümleri (i/İ, ı/I).
 *
 * React Native'in `textTransform`'u yerel ayarı bilmez ("i" → noktasız "I"); Hermes'te
 * `toLocaleUpperCase('tr-TR')` / `toLocaleLowerCase('tr-TR')` da yerel ayarı her derlemede
 * dikkate almıyor. Bu yüzden Türkçe'ye özgü harfler genel dönüşümden önce elle eşlenir.
 * Ortak `Paragraph`, `textTransform` gelen metinleri bu yardımcılarla çevirir.
 */

const TURKISH_UPPER: Record<string, string> = { i: 'İ', ı: 'I' };
const TURKISH_LOWER: Record<string, string> = { I: 'ı', İ: 'i' };

/** Tek bir karakteri Türkçe kurallarıyla büyük harfe çevirir ("i" → "İ"). */
function toTurkishUpperChar(char: string): string {
  return TURKISH_UPPER[char] ?? char.toUpperCase();
}

/** Metni Türkçe kurallarıyla büyük harfe çevirir ("Siparişleriniz" → "SİPARİŞLERİNİZ"). */
export function toTurkishUpperCase(value: string): string {
  return value.replace(/[iı]/g, (char) => TURKISH_UPPER[char]).toUpperCase();
}

/** Metni Türkçe kurallarıyla küçük harfe çevirir ("IŞIK" → "ışık", "İPEK" → "ipek"). */
export function toTurkishLowerCase(value: string): string {
  return value.replace(/[Iİ]/g, (char) => TURKISH_LOWER[char]).toLowerCase();
}

/**
 * `textTransform="capitalize"` gibi: her kelimenin ilk harfini büyütür, kalanına dokunmaz
 * ("ilk sipariş" → "İlk Sipariş"). Boşluklar olduğu gibi kalır.
 */
export function toTurkishCapitalized(value: string): string {
  return value.replace(/(^|\s)(\S)/gu, (_match, space: string, first: string) => space + toTurkishUpperChar(first));
}

/**
 * Her kelimenin ilk harfini büyütür, kalanını küçültür ("ışıklı PİJAMA" →
 * "Işıklı Pijama"). Ardışık boşluklar teke indirilir. Kelime sınırı için `\b`
 * kullanılmaz; JS'te `\b` yalnızca ASCII harfleri tanır.
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
