import { forwardRef } from 'react';
import { Paragraph as TamaguiParagraph, type GetProps } from 'tamagui';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';

export type ParagraphProps = GetProps<typeof TamaguiParagraph>;

/**
 * Uygulamadaki tek metin bileşeni. Tamagui'nin `Paragraph`'ının üstüne OS yazı
 * boyutu ayarı için bir tavan koyar; bunun ötesinde yerleşim bozuluyordu.
 *
 * Tavanı yüzey bazında sıkmak için `maxFontSizeMultiplier` prop'unu geçmek
 * yeterli — props sonra yayıldığı için varsayılanı ezer
 * (bkz. `COMPACT_MAX_FONT_SCALE`).
 */
export const Paragraph = forwardRef<any, ParagraphProps>(function Paragraph(props, ref) {
  return <TamaguiParagraph maxFontSizeMultiplier={MAX_FONT_SCALE} ref={ref} {...props} />;
});
