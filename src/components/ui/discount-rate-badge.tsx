import { styled, XStack, type GetProps } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TrendingDown } from '@/components/ui/icons';

const BadgeFrame = styled(XStack, {
  name: 'DiscountRateBadge',
  alignItems: 'center',
  backgroundColor: '$discountBadge',
  borderRadius: 999,
  flexShrink: 0,

  variants: {
    size: {
      sm: { gap: 2, paddingHorizontal: 8, paddingVertical: 2 },
      md: { gap: 3, paddingHorizontal: '$2.5', paddingVertical: 2 },
    },
  } as const,

  defaultVariants: { size: 'md' },
});

const ICON_SIZE = { sm: 12, md: 13 } as const;

export type DiscountRateBadgeProps = GetProps<typeof BadgeFrame> & {
  /** Gösterilecek indirim yüzdesi. 0 veya geçersizse rozet hiç çizilmez. */
  rate: number | undefined;
  /** Yüksekliği sabit yüzeylerde (sticky footer) yazı büyümesini sınırlar. */
  maxFontSizeMultiplier?: number;
};

/**
 * "%20" indirim rozeti: yuvarlak hap, aşağı yönlü trend ikonu ve beyaz metin.
 *
 * Kendi zeminini taşıdığı için metin ve ikon rengi bileşenin içinde sabitlenir;
 * çağıran yüzeyler tema değişiminde kontrast yaması yapmak zorunda kalmaz.
 * Olmayan bir indirim vaat edilmemesi kuralı da burada tutulur: pozitif olmayan
 * bir oran verildiğinde rozet `null` döner, böylece her çağıran aynı koşulu
 * tekrar yazmaz.
 */
export function DiscountRateBadge({
  maxFontSizeMultiplier,
  rate,
  size = 'md',
  ...frameProps
}: DiscountRateBadgeProps) {
  if (rate === undefined || !Number.isFinite(rate) || rate <= 0) return null;

  const rateLabel = rate.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

  return (
    <BadgeFrame
      accessibilityLabel={`yüzde ${rateLabel} indirim`}
      accessibilityRole="text"
      size={size}
      {...frameProps}
    >
      <TrendingDown color="white" size={ICON_SIZE[size]} strokeWidth={2.5} />
      <Paragraph
        color="white"
        fontSize={11}
        fontWeight="800"
        lineHeight={15}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        %{rateLabel}
      </Paragraph>
    </BadgeFrame>
  );
}
