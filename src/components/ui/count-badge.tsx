import { type ReactNode } from 'react';
import { styled, XStack, YStack, type GetProps } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';

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
  /** Yüksekliği sabit yüzeylerde yazı büyümesini sınırlar. */
  maxFontSizeMultiplier?: number;
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
  maxFontSizeMultiplier = COMPACT_MAX_FONT_SCALE,
  size = COUNT_BADGE_SIZE,
  ...frameProps
}: CountBadgeProps) {
  if (count === undefined || !Number.isFinite(count) || count <= 0) return null;

  return (
    <BadgeFrame accessibilityRole="text" height={size} minWidth={size} {...frameProps}>
      <Paragraph
        color="white"
        fontSize={Math.round(size * FONT_SIZE_RATIO)}
        fontWeight="900"
        includeFontPadding={false}
        lineHeight={size}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        textAlign="center"
      >
        {count > max ? `${max}+` : count}
      </Paragraph>
    </BadgeFrame>
  );
}

export type IconWithCountBadgeProps = Omit<CountBadgeProps, 'testID'> & {
  /** Rozetin çapasını oluşturan ikon. */
  icon: ReactNode;
  /** Çapa kutusunun testID'si. */
  testID?: string;
  /** Rozetin kendi testID'si. */
  badgeTestID?: string;
};

/**
 * Sayaç rozetini ikonun kendi kutusuna çapalar. Rozet doğrudan bir kolonun
 * içine konduğunda kolon, ikondan geniş olan etiketle birlikte ölçüldüğü için
 * rozet ikondan uzağa düşüyordu; o çapa kuralı burada tek yerde tutulur.
 */
export function IconWithCountBadge({
  badgeTestID,
  icon,
  testID,
  ...badgeProps
}: IconWithCountBadgeProps) {
  return (
    <YStack position="relative" testID={testID}>
      {icon}
      <CountBadge {...badgeProps} testID={badgeTestID} />
    </YStack>
  );
}
