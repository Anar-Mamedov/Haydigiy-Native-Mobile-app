/**
 * Seçenek etiketlerinin başındaki emojiyi ayırır ("📦 Siparişlerim" → simge "📦", metin
 * "Siparişlerim"); web `AssistantButtonsBlock.splitLeadingEmoji` ile aynı sonuç.
 *
 * Web `\p{Extended_Pictographic}` kullanıyor. Hermes'in Unicode özellik kaçışlarında bu ikili
 * özelliği desteklediği garanti olmadığı için (desteklemezse modül yüklenirken SyntaxError)
 * burada emoji kod noktası aralıklarıyla taranır. Etiket metni değiştirilmez; yalnız baştaki
 * emoji dizisi ve ardından gelen boşluk ayrılır.
 */

export type LabelEmojiParts = { icon: string | null; text: string };

const VARIATION_SELECTOR_16 = 0xfe0f;
const ZERO_WIDTH_JOINER = 0x200d;
const COMBINING_KEYCAP = 0x20e3;
const SKIN_TONE_FIRST = 0x1f3fb;
const SKIN_TONE_LAST = 0x1f3ff;
const REGIONAL_INDICATOR_FIRST = 0x1f1e6;
const REGIONAL_INDICATOR_LAST = 0x1f1ff;

/** Tek başına emoji olarak çizilen aralıklar (ok/işaret blokları yalnız FE0F ile emoji olur). */
const isPictographic = (codePoint: number): boolean =>
  (codePoint >= 0x1f000 && codePoint <= 0x1faff) ||
  (codePoint >= 0x2600 && codePoint <= 0x27bf) ||
  (codePoint >= 0x2300 && codePoint <= 0x23ff) ||
  (codePoint >= 0x2b00 && codePoint <= 0x2bff);

/** Yalnız ardından FE0F gelirse emoji olarak çizilen semboller (↩️, ⤴️ gibi oklar). */
const isEmojiWithSelector = (codePoint: number): boolean =>
  (codePoint >= 0x2190 && codePoint <= 0x21ff) || (codePoint >= 0x2900 && codePoint <= 0x297f);

const isModifier = (codePoint: number): boolean =>
  codePoint === VARIATION_SELECTOR_16 ||
  codePoint === COMBINING_KEYCAP ||
  (codePoint >= SKIN_TONE_FIRST && codePoint <= SKIN_TONE_LAST);

const isRegionalIndicator = (codePoint: number): boolean =>
  codePoint >= REGIONAL_INDICATOR_FIRST && codePoint <= REGIONAL_INDICATOR_LAST;

const isEmojiStart = (codePoints: number[], index: number): boolean => {
  const codePoint = codePoints[index];
  if (codePoint === undefined) return false;
  if (isPictographic(codePoint)) return true;
  return isEmojiWithSelector(codePoint) && codePoints[index + 1] === VARIATION_SELECTOR_16;
};

/** Baştaki emoji dizisinin kod noktası uzunluğu; emoji yoksa 0. */
const leadingEmojiLength = (codePoints: number[]): number => {
  if (!isEmojiStart(codePoints, 0)) return 0;

  let index = 1;
  // Bayrak: iki bölgesel gösterge harfi tek emojidir.
  if (isRegionalIndicator(codePoints[0]) && isRegionalIndicator(codePoints[1] ?? -1)) index = 2;

  for (;;) {
    while (index < codePoints.length && isModifier(codePoints[index])) index += 1;
    // ZWJ dizisi (👩‍💻): birleştiriciden sonra yine emoji gelirse dizi sürer.
    if (codePoints[index] === ZERO_WIDTH_JOINER && isEmojiStart(codePoints, index + 1)) {
      index += 2;
      continue;
    }
    return index;
  }
};

export function splitLeadingEmoji(label: string): LabelEmojiParts {
  const codePoints = Array.from(label.trimStart(), (char) => char.codePointAt(0) ?? 0);
  const length = leadingEmojiLength(codePoints);
  if (length === 0) return { icon: null, text: label };

  const icon = String.fromCodePoint(...codePoints.slice(0, length));
  const text = String.fromCodePoint(...codePoints.slice(length)).trimStart();
  // Etiket yalnız emojiden oluşuyorsa olduğu gibi kalır; simge ikinci kez çizilmez.
  return text ? { icon, text } : { icon: null, text: label };
}
