/**
 * Kullanıcı girdilerini düz metne indirger.
 *
 * Sosyal medyada yaygın olan 'süslü font' karakterleri (𝙶𝚞̈𝚕, 𝐆𝐮𝐥, ɢᴜʟ, 🅖🅤🅛)
 * görünüşte normal harftir ama farklı Unicode kod noktalarıdır. Kopyala-yapıştır
 * ile ad/soyad ya da adres alanına girdiklerinde kargo etiketinde, e-faturada ve
 * panel aramasında bozuk çıkarlar. Bu modül önce bu karakterleri karşılıkları olan
 * Latin harflere çevirir (silmez), sonra alana göre beyaz liste uygular.
 *
 * Web tarafındaki `src/lib/utils/turkishLatinInput.ts` ile aynı davranışı verir;
 * biri değişirse diğeri de güncellenmeli.
 */

const TURKISH_LATIN_AND_SPACE = /[^a-zA-ZıİşŞğĞüÜöÖçÇ\s'.-]/gu;
const TURKISH_LATIN_SPACE_AND_PUNCT = /[^a-zA-Z0-9ıİşŞğĞüÜöÖçÇ\s.,\-/]/gu;

const WHITESPACE_RUN = /\s+/gu;

/**
 * NFKC'nin katlamadığı taklit harf aileleri. Küçük kapiteller (ɢᴜʟ) font
 * üreticilerinde en sık kullanılan ailedir; Unicode'da fonetik harf sayıldıkları
 * için normalize edilmezler ve elle eşlenmeleri gerekir.
 */
const LOOKALIKE_LETTERS: Record<string, string> = {
  ᴀ: 'a',
  ʙ: 'b',
  ᴄ: 'c',
  ᴅ: 'd',
  ᴇ: 'e',
  ꜰ: 'f',
  ɢ: 'g',
  ʜ: 'h',
  ɪ: 'i',
  ᴊ: 'j',
  ᴋ: 'k',
  ʟ: 'l',
  ᴍ: 'm',
  ɴ: 'n',
  ᴏ: 'o',
  ᴘ: 'p',
  ʀ: 'r',
  ꜱ: 's',
  ᴛ: 't',
  ᴜ: 'u',
  ᴠ: 'v',
  ᴡ: 'w',
  ʏ: 'y',
  ᴢ: 'z',
  // Tipografik tırnak ve tireler: NFKC bunları da katlamaz.
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '′': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '″': '"',
  '‐': '-',
  '‑': '-',
  '‒': '-',
  '–': '-',
  '—': '-',
  '―': '-',
  '−': '-',
};

/** A-Z ile hizalı, NFKC'nin katlamadığı kapalı harf blokları. */
const LOOKALIKE_RANGES = [
  { start: 0x1f150, end: 0x1f169 }, // negatif daire içinde harfler
  { start: 0x1f170, end: 0x1f189 }, // negatif kare içinde harfler
  { start: 0x1f1e6, end: 0x1f1ff }, // bölge göstergesi (bayrak harfleri)
];

const UPPERCASE_A = 'A'.charCodeAt(0);

/**
 * Sıfır genişlikli birleştirici, yön değiştirme kontrolü, BOM ve C0/C1 kontrol
 * karakterleri. Sekme (0x09), satır sonu (0x0a) ve satır başı (0x0d) bilerek
 * korunur; serbest metin alanlarında satır sonu geçerli bir girdidir.
 */
function isInvisibleCodePoint(codePoint: number): boolean {
  return (
    codePoint <= 0x08 ||
    codePoint === 0x0b ||
    codePoint === 0x0c ||
    (codePoint >= 0x0e && codePoint <= 0x1f) ||
    (codePoint >= 0x7f && codePoint <= 0x9f) ||
    codePoint === 0x00ad || // yumuşak tire
    codePoint === 0x061c || // arapça harf işareti
    codePoint === 0x180e || // moğolca sesli harf ayırıcı
    (codePoint >= 0x200b && codePoint <= 0x200f) || // sıfır genişlikli + yön işaretleri
    (codePoint >= 0x202a && codePoint <= 0x202e) || // bidi gömme/geçersiz kılma
    (codePoint >= 0x2060 && codePoint <= 0x206f) || // kelime birleştirici + kullanımdan kalkmış biçim
    codePoint === 0xfeff || // BOM
    (codePoint >= 0xfff9 && codePoint <= 0xfffb) // satır arası açıklama
  );
}

/** NBSP, ogham, ince/em boşluk gibi egzotik boşluklar; normal boşluğa çevrilir. */
function isExoticWhitespace(codePoint: number): boolean {
  return (
    codePoint === 0x00a0 ||
    codePoint === 0x1680 ||
    (codePoint >= 0x2000 && codePoint <= 0x200a) ||
    codePoint === 0x202f ||
    codePoint === 0x205f ||
    codePoint === 0x3000
  );
}

/** NFKC'nin ıskaladığı taklit harfleri düz ASCII karşılıklarına çevirir. */
function foldLookalikes(value: string): string {
  let result = '';

  for (const char of value) {
    const mapped = LOOKALIKE_LETTERS[char];
    if (mapped !== undefined) {
      result += mapped;
      continue;
    }

    const codePoint = char.codePointAt(0) ?? 0;
    const range = LOOKALIKE_RANGES.find(
      (item) => codePoint >= item.start && codePoint <= item.end,
    );
    result += range
      ? String.fromCharCode(UPPERCASE_A + (codePoint - range.start))
      : char;
  }

  return result;
}

/** Görünmez karakterleri atar, egzotik boşlukları normal boşluğa çevirir. */
function stripInvisibleChars(value: string): string {
  let result = '';

  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (isInvisibleCodePoint(codePoint)) continue;
    result += isExoticWhitespace(codePoint) ? ' ' : char;
  }

  return result;
}

/** Hermes `normalize` destekler; yine de motor değişimine karşı korunuyoruz. */
const canNormalize = typeof String.prototype.normalize === 'function';

/**
 * Süslü font karakterlerini düz metne çevirir. Beyaz liste uygulamaz; satır
 * sonlarını ve noktalama işaretlerini korur.
 *
 * NFKC math/fullwidth/daire-kare ailelerini katlar, NFC ise ayrık birleşen
 * aksanları geri birleştirir: `u` + U+0308 → `ü`.
 */
export function normalizeUnicodeText(value: string): string {
  if (!value) return '';

  let result = foldLookalikes(value);

  if (canNormalize) {
    // NFKC bazı harfleri katladıktan sonra ortaya yeni taklit harf çıkabildiği
    // için eşleme ikinci kez uygulanır.
    result = foldLookalikes(result.normalize('NFKC').normalize('NFC'));
  }

  return stripInvisibleChars(result);
}

/** Serbest metin (soru, yorum, geri bildirim): sadece normalize eder, karakter silmez. */
export function toPlainText(value: string): string {
  return normalizeUnicodeText(value);
}

/** Ad, soyad, başlık, vergi dairesi, firma adı: Türkçe + Latin harfler, boşluk, kesme ve tire */
export function toPersonName(value: string): string {
  // Tek satırlık alan: satır sonları boşluğa indirilir. Yazmayı bozmamak için
  // trim uygulanmaz, sadece ardışık boşluklar teke düşürülür.
  return normalizeUnicodeText(value)
    .replace(TURKISH_LATIN_AND_SPACE, '')
    .replace(WHITESPACE_RUN, ' ');
}

/** Adres satırı: Türkçe + Latin + rakam, boşluk ve ., - / */
export function toAddressText(value: string): string {
  return normalizeUnicodeText(value).replace(TURKISH_LATIN_SPACE_AND_PUNCT, '');
}
