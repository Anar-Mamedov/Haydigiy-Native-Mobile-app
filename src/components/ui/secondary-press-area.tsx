import { type ReactNode } from 'react';
import { Pressable } from 'react-native';

type SecondaryPressAreaProps = {
  children: ReactNode;
  onPress: () => void;
  testID?: string;
};

/**
 * Aynı eylemi zaten sunan erişilebilir bir düğmenin (ör. kartın "Ürün detayını aç" düğmesi)
 * yanındaki ek dokunma alanı: parmakla basan kullanıcı için çalışır, erişilebilirlik servislerine
 * ise ayrı bir düğme olarak sunulmaz.
 * - `accessible={false}`: ekran okuyucu aynı eylemi ikinci kez duyurmaz.
 * - `focusable={false}`: Pressable varsayılan olarak Android görünümünü "tıklanabilir" işaretler.
 *   Öyle kalınca Play lansman öncesi raporu bu ince şeritleri (24–27dp) ayrı bir dokunma hedefi
 *   sayıp 48dp uyarısı veriyordu. Basış JS tarafında işlendiği için dokunuş çalışmaya devam eder.
 *
 * Tek başına bir eylem için kullanılmaz; asıl düğme yoksa `IconButton` ya da `TextActionButton`.
 */
export function SecondaryPressArea({ children, onPress, testID }: SecondaryPressAreaProps) {
  return (
    <Pressable accessible={false} focusable={false} onPress={onPress} testID={testID}>
      {children}
    </Pressable>
  );
}
