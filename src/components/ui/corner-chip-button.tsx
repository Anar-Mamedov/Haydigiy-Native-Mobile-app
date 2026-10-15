import { YStack } from 'tamagui';
import { IconButton, type IconButtonProps } from '@/components/ui/icon-button';

export type ChipCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/**
 * Çipin çevresinde bırakılan şeffaf dokunma payının üst sınırı. Pay, çipin kenara uzaklığını hiç
 * aşmaz; böylece dokunma kutusu kapsayıcının dışına taşmaz (taşan kısım dokunuş almaz).
 */
const MAX_TOUCH_INSET = 8;

export type CornerChipButtonProps = Omit<
  IconButtonProps,
  'alignItems' | 'justifyContent' | 'padding' | 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'size'
> & {
  corner: ChipCorner;
  /** Çipin soldaki ya da sağdaki kenara uzaklığı (dp); çip ekranda tam burada görünür. */
  offsetX: number;
  /** Çipin üstteki ya da alttaki kenara uzaklığı (dp). */
  offsetY: number;
  zIndex?: number;
};

/**
 * Bir görselin köşesine iliştirilmiş küçük çip buton (favori kalbi, "VİDEO", renk seçenekleri).
 * Çip görüldüğü yerde ve boyutta kalır; dokunma alanı ise çipi saran ve köşeden içeri doğru
 * büyüyen en az 48dp'lik kutudur. Konumlandırma bileşenin kendisinde: göreli konumlu bir
 * kapsayıcının (ör. kart görseli) içine konur.
 */
export function CornerChipButton({ children, corner, offsetX, offsetY, zIndex, ...buttonProps }: CornerChipButtonProps) {
  const isTop = corner === 'topLeft' || corner === 'topRight';
  const isLeft = corner === 'topLeft' || corner === 'bottomLeft';
  const insetX = Math.min(Math.max(offsetX, 0), MAX_TOUCH_INSET);
  const insetY = Math.min(Math.max(offsetY, 0), MAX_TOUCH_INSET);
  const verticalEdge = offsetY - insetY;
  const horizontalEdge = offsetX - insetX;

  return (
    <YStack
      bottom={isTop ? undefined : verticalEdge}
      left={isLeft ? horizontalEdge : undefined}
      position="absolute"
      right={isLeft ? undefined : horizontalEdge}
      top={isTop ? verticalEdge : undefined}
      zIndex={zIndex}
    >
      <IconButton
        {...buttonProps}
        alignItems={isLeft ? 'flex-start' : 'flex-end'}
        justifyContent={isTop ? 'flex-start' : 'flex-end'}
        paddingBottom={insetY}
        paddingLeft={insetX}
        paddingRight={insetX}
        paddingTop={insetY}
      >
        {children}
      </IconButton>
    </YStack>
  );
}
