import { useWindowDimensions } from 'react-native';

/**
 * Metinlerin OS yazı boyutu ayarıyla büyüyebileceği üst sınır.
 *
 * 1.3'te ödeme alt çubuğu gibi dar ekranlar hâlâ bozuluyordu; tavan %15'e çekildi.
 * Yazıyı büyüten kullanıcı yine bir miktar büyüme görür (erişilebilirlik tamamen
 * kapanmaz), ama yerleşim tasarım ölçüsünden fazla uzaklaşmaz.
 */
export const MAX_FONT_SCALE = 1.15;

/**
 * Yüksekliği sabit, yatayda yeri dar olan yüzeyler için daha sıkı sınır:
 * alt navigasyon etiketleri, rozetler, beden çipleri, sticky footer.
 * Her zaman `MAX_FONT_SCALE`'in altında kalır.
 */
export const COMPACT_MAX_FONT_SCALE = 1.1;

/**
 * Tavanın varsayılan olarak uygulandığı Tamagui metin bileşenleri. Tamagui config
 * varsayılanlarını bileşenin kendi adıyla arar; Button yazısı gibi adsız türevler üst
 * bileşenin (SizableText) adını devralır.
 *
 * Input/TextArea burada YOK: Tamagui'nin `Input`'u bu prop'u kendi props'undan okuyup
 * native alana açıkça geçirdiği için config varsayılanı ona ulaşmıyor. Input, TextArea ve
 * React Native `TextInput` kullanımlarına `maxFontSizeMultiplier={MAX_FONT_SCALE}` elle verilir.
 */
const FONT_SCALED_COMPONENTS = [
  'Text',
  'SizableText',
  'Paragraph',
  'Heading',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'Label',
];

/**
 * `createTamagui({ defaultProps })` için: `Paragraph` dışından render edilen metinler de
 * tavanı uygulasın diye. Bileşene açıkça verilen `maxFontSizeMultiplier`
 * (ör. `COMPACT_MAX_FONT_SCALE`) bu varsayılanı ezer.
 */
export const FONT_SCALE_DEFAULT_PROPS = Object.fromEntries(
  FONT_SCALED_COMPONENTS.map((name) => [name, { maxFontSizeMultiplier: MAX_FONT_SCALE }]),
);

/** OS ölçeğini verilen tavana kırpar; 1'in altına düşmez. */
export function clampFontScale(fontScale: number, max: number = MAX_FONT_SCALE): number {
  if (!Number.isFinite(fontScale) || fontScale <= 1) return 1;

  return Math.min(fontScale, max);
}

/**
 * Kırpılmış yazı ölçeği. `useWindowDimensions` kullanıldığı için kullanıcı
 * ayarı uygulama açıkken değiştirirse bileşen yeniden render olur.
 */
export function useFontScale(max: number = MAX_FONT_SCALE): number {
  const { fontScale } = useWindowDimensions();

  return clampFontScale(fontScale, max);
}

/**
 * İkon/görsel ölçüsünü metinle aynı oranda büyütür. İkonlar sabit kalınca yazı
 * büyüdükçe aradaki fark açılıyordu; bu ikisini birlikte hareket ettirir.
 */
export function useScaledSize(size: number, max: number = MAX_FONT_SCALE): number {
  return Math.round(size * useFontScale(max));
}
