import { ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import { tokenValues } from '@/lib/theme/token-values';

export const MIN_TOUCH_TARGET = tokenValues.minTouchTarget;

export type IconButtonProps = Omit<PressableProps, 'accessibilityLabel' | 'children' | 'hitSlop' | 'style'> &
  Pick<
    ViewStyle,
    'alignItems' | 'justifyContent' | 'padding' | 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop'
  > & {
    /** Ekran okuyucunun okuyacağı ad; ikon tek başına anlam taşımadığı için zorunlu. */
    accessibilityLabel: string;
    /** İkon ya da ikonu taşıyan küçük görsel çip. */
    children: ReactNode;
    /** Dokunma alanının en küçük kenarı; 48dp'nin altına inmez. Daha geniş bir çip alanı kendisi büyütür. */
    size?: number;
  };

/**
 * Yalnızca ikondan (ya da küçük bir çipten) oluşan buton. Görünen ikon/çip küçük kalabilir, ama
 * dokunma alanı her zaman en az 48dp: `hitSlop` erişilebilirlik taramasına görünmediği için alanı
 * kutunun kendisi taşır. Çip bir köşede duracaksa hizalama ve iç boşluk prop'larıyla alan içinde
 * konumlanır; böylece alan büyürken çipin ekrandaki yeri değişmez.
 */
export function IconButton({
  accessibilityLabel,
  accessibilityRole = 'button',
  alignItems = 'center',
  children,
  justifyContent = 'center',
  padding,
  paddingBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  size = MIN_TOUCH_TARGET,
  ...pressableProps
}: IconButtonProps) {
  const edge = Math.max(size, MIN_TOUCH_TARGET);

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={({ pressed }) => ({
        alignItems,
        justifyContent,
        minHeight: edge,
        minWidth: edge,
        opacity: pressed ? 0.6 : 1,
        padding,
        paddingBottom,
        paddingLeft,
        paddingRight,
        paddingTop,
      })}
    >
      {children}
    </Pressable>
  );
}
