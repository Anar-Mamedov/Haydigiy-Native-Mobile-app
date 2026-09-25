import { type ReactNode } from 'react';
import { styled, XStack, YStack, type GetProps } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

/** Rozetin varsayılan çapı: ikonların sağ üst köşesine oturan 18pt'lik hap. */
export const COUNT_BADGE_SIZE = 18;

/** Bu değerin üstündeki sayılar "9+" olarak kısaltılır. */
const DEFAULT_MAX_COUNT = 9;

/** Yazı yüksekliği hap içinde ortalanırken kullanılan oran (18 → 10pt). */
const FONT_SIZE_RATIO = 0.56;

const BadgeFrame = styled(XStack, {
  name: 'CountBadge',
  alignItems: 'center',
  backgroundColor: '$brand',
  borderRadius: 999,
  justifyContent: 'center',
  paddingHorizontal: 4,
  // Çapa her zaman sarmalayıcının sağ üst köşesi; sarmalayıcı ikonun kendisi
  // olmalı, yoksa rozet ikondan kopup etiketin hizasına kayıyor.
  position: 'absolute',
  right: -6,
  top: -6,
});

export type CountBadgeProps = Omit<GetProps<typeof BadgeFrame>, 'size'> & {
  /** Gösterilecek adet. Tanımsız, geçersiz veya pozitif değilse rozet çizilmez. */
  count: number | undefined;
  /** Kısaltma eşiği; varsayılan 9 ("9+"). */
  max?: number;
  /** Hapın çapı. İkonla birlikte ölçeklenmesi gereken yüzeyler kendi ölçüsünü verir. */
  size?: number;
};

/**
 * Bir ikonun ya da çipin sağ üst köşesinde duran sayaç rozeti (sepet adedi,
 * aktif filtre sayısı).
 *
 * Kendi zeminini taşıdığı için metin rengi bileşenin içinde sabitlenir; çağıran
 * yüzeyler tema değişiminde kontrast yaması yapmak zorunda kalmaz. Boş sayaçta
 * hiç çizilmeme kuralı da burada tutulur, böylece her çağıran aynı koşulu
 * tekrar yazmaz.
 */
export function CountBadge({
  count,
  max = DEFAULT_MAX_COUNT,
  size = COUNT_BADGE_SIZE,
  ...frameProps
}: CountBadgeProps) {
  if (count === undefined || !Number.isFinite(count) || count <= 0) return null;

  return (
    <BadgeFrame accessibilityRole="text" height={size} minWidth={size} {...frameProps}>
      {/* Rakam yalnızca hapın çapından türetilir. OS yazı ölçeği ayrıca uygulanınca
          rakam sabit çaplı hapa sığmıyor, büyük yazı ayarında hapın sol altına
          kayıyordu. Yazıyla büyümesi gereken yüzeyler `size`'ı zaten ölçekli verir. */}
      <Paragraph
        allowFontScaling={false}
        color="white"
        fontSize={Math.round(size * FONT_SIZE_RATIO)}
        fontWeight="900"
        includeFontPadding={false}
        lineHeight={size}
        textAlign="center"
      >
        {count > max ? `${max}+` : count}
      </Paragraph>
    </BadgeFrame>
  );
}

export type IconWithCountBadgeProps = Pick<CountBadgeProps, 'count' | 'max'> & {
  /** Rozetin çapasını oluşturan ikon. */
  icon: ReactNode;
  /**
   * Rozetin çapı. Adı bilerek `size` değil: Tamagui `Button` ikon yuvasına konan
   * öğeye kendi ikon ölçüsünü `size` ve `color` olarak enjekte ediyor, rozet de
   * bunu alınca 18 yerine 15 çiziliyordu.
   */
  badgeSize?: number;
  /** Çapa kutusunun testID'si. */
  testID?: string;
  /** Rozetin kendi testID'si. */
  badgeTestID?: string;
};

/**
 * Sayaç rozetini ikonun kendi kutusuna çapalar. Rozet doğrudan bir kolonun
 * içine konduğunda kolon, ikondan geniş olan etiketle birlikte ölçüldüğü için
 * rozet ikondan uzağa düşüyordu; o çapa kuralı burada tek yerde tutulur.
 * Rozete yalnızca tanımlı prop'lar iletilir, ikon yuvasının enjekte ettikleri değil.
 */
export function IconWithCountBadge({
  badgeSize,
  badgeTestID,
  count,
  icon,
  max,
  testID,
}: IconWithCountBadgeProps) {
  return (
    <YStack position="relative" testID={testID}>
      {icon}
      <CountBadge count={count} max={max} size={badgeSize} testID={badgeTestID} />
    </YStack>
  );
}
