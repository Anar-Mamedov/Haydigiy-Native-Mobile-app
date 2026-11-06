import { Children, forwardRef, type ReactNode } from 'react';
import { Paragraph as TamaguiParagraph, type GetProps } from 'tamagui';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { toTurkishCapitalized, toTurkishLowerCase, toTurkishUpperCase } from '@/utils/turkish-case';

export type ParagraphProps = GetProps<typeof TamaguiParagraph>;

/** Turkish-aware replacements for the native `textTransform` values. */
const TURKISH_TEXT_TRANSFORMS: Record<string, (value: string) => string> = {
  uppercase: toTurkishUpperCase,
  lowercase: toTurkishLowerCase,
  capitalize: toTurkishCapitalized,
};

/** Only plain text can be rewritten here; nested elements keep the native transform. */
function isPlainText(children: ReactNode): boolean {
  return Children.toArray(children).every((child) => typeof child === 'string' || typeof child === 'number');
}

function transformPlainText(children: ReactNode, transform: (value: string) => string): ReactNode {
  if (typeof children === 'string') return transform(children);
  if (Array.isArray(children)) {
    return children.map((child) => (typeof child === 'string' ? transform(child) : child));
  }
  return children;
}

/**
 * Uygulamadaki tek metin bileşeni. Tamagui'nin `Paragraph`'ının üstüne OS yazı
 * boyutu ayarı için bir tavan koyar; bunun ötesinde yerleşim bozuluyordu.
 *
 * Tavanı yüzey bazında sıkmak için `maxFontSizeMultiplier` prop'unu geçmek
 * yeterli — props sonra yayıldığı için varsayılanı ezer
 * (bkz. `COMPACT_MAX_FONT_SCALE`).
 *
 * `textTransform` (uppercase/lowercase/capitalize) native'e bırakılmaz: React Native yerel
 * ayarı bilmez ve "i"yi noktasız "I" yapar ("SIPARIŞ"). Düz metin Türkçe kurallarla burada
 * çevrilir; içinde başka eleman olan metin native dönüşümde kalır.
 */
export const Paragraph = forwardRef<any, ParagraphProps>(function Paragraph(
  { children, textTransform, ...props },
  ref,
) {
  const turkishTransform = typeof textTransform === 'string' ? TURKISH_TEXT_TRANSFORMS[textTransform] : undefined;

  if (!turkishTransform || !isPlainText(children)) {
    return (
      <TamaguiParagraph maxFontSizeMultiplier={MAX_FONT_SCALE} ref={ref} textTransform={textTransform} {...props}>
        {children}
      </TamaguiParagraph>
    );
  }

  return (
    <TamaguiParagraph maxFontSizeMultiplier={MAX_FONT_SCALE} ref={ref} {...props}>
      {transformPlainText(children, turkishTransform)}
    </TamaguiParagraph>
  );
});
