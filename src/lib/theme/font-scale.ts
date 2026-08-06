import { useWindowDimensions } from 'react-native';

/**
 * Metinlerin OS yazı boyutu ayarıyla büyüyebileceği üst sınır.
 *
 * 1.3, iOS'un erişilebilirlik dışı Dynamic Type aralığını (~1.35x) neredeyse
 * tamamen kapsar; yani ayarı bir-iki kademe büyütmüş sıradan kullanıcı hiçbir
 * şey kaybetmez. Erişilebilirlik boyutlarında (iOS AX1-AX5, Android 2x) yerleşim
 * bozulmasın diye burada duruyoruz.
 */
export const MAX_FONT_SCALE = 1.3;

/**
 * Yüksekliği sabit, yatayda yeri dar olan yüzeyler için daha sıkı sınır:
 * alt navigasyon etiketleri, rozetler, beden çipleri, sticky footer.
 */
export const COMPACT_MAX_FONT_SCALE = 1.15;

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
