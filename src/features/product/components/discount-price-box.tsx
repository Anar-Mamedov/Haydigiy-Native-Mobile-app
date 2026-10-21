import { styled, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { DiscountRateBadge } from '@/components/ui/discount-rate-badge';

/**
 * Kutunun renk dili. `discount`: yeşil çerçeveli indirim kutusu. `regular`: indirim sayılmayan
 * fiyatın turuncu kutusu (web `border-orange-100 bg-orange-50/80` + `#f27a1a` fiyat) — sticky
 * footer'daki indirimsiz fiyat kutusuyla aynı tema token'ları.
 */
export type PriceBoxTone = 'discount' | 'regular';

/**
 * Fiyatların dizilişi. `inline`: eski ve güncel fiyat yan yana tek satır. `stacked`: eski fiyat
 * üstte, güncel fiyat altta — kutu yalnız geniş fiyat kadar yer kaplar, yatayda dar alt barda
 * yanındaki aksiyon butonunun yazısı kesilmez. Dikey boşluk sıkı tutulur ki iki satır alt barın
 * aksiyon yüksekliğini (48) aşmasın ve bar yüksekliği değişmesin.
 */
export type PriceBoxLayout = 'inline' | 'stacked';

const PriceBoxFrame = styled(YStack, {
  name: 'DiscountPriceBox',
  borderRadius: 8,
  borderWidth: 1,
  paddingHorizontal: 10,
  position: 'relative',

  variants: {
    tone: {
      discount: { backgroundColor: '$discountBackground', borderColor: '$discount' },
      regular: { backgroundColor: '$orange2', borderColor: '$orange5' },
    },
    layout: {
      inline: { paddingVertical: 6 },
      stacked: { paddingVertical: 3 },
    },
  } as const,

  defaultVariants: { layout: 'inline', tone: 'discount' },
});

const PriceLines = styled(YStack, {
  name: 'DiscountPriceBoxLines',

  variants: {
    layout: {
      inline: { alignItems: 'baseline', flexDirection: 'row', gap: 6 },
      stacked: { alignItems: 'flex-start', flexDirection: 'column' },
    },
  } as const,

  defaultVariants: { layout: 'inline' },
});

const PRICE_COLOR = { discount: '$discount', regular: '$brand' } as const;

const PREVIOUS_PRICE_TYPE = {
  inline: { fontSize: 13, lineHeight: 17 },
  stacked: { fontSize: 12, lineHeight: 15 },
} as const;

/** Sağ üstteki oran rozeti üst satırın sağ ucuna biner; uzun eski fiyat onun altında kalmasın. */
const STACKED_BADGE_CLEARANCE = 36;

export type DiscountPriceBoxProps = {
  /** Ekran okuyucular kutuyu parça parça değil tek cümle olarak duysun. */
  accessibilityLabel: string;
  /** Sağ üst rozetteki yüzde; yoksa rozet çizilmez. */
  discountRate?: number;
  /** Varsayılan `inline`; yatayda yeri dar yüzeyler `stacked` ile iki satır çizer. */
  layout?: PriceBoxLayout;
  maxFontSizeMultiplier?: number;
  /** Güncel/geçerli fiyatın biçimlenmiş metni. */
  priceLabel: string;
  /** Üstü çizili karşılaştırma fiyatı; yoksa satır tek fiyattan oluşur. */
  previousPriceLabel?: string;
  /** Satır yüksekliklerini kullanıcının yazı ölçeğiyle birlikte büyütür. */
  scale?: number;
  testID?: string;
  /** Varsayılan `discount`; indirim sayılmayan fiyat `regular` ile turuncu çizilir. */
  tone?: PriceBoxTone;
};

/**
 * Ürün detayındaki fiyat kutusunun ortak gövdesi: üstü çizili karşılaştırma
 * fiyatı, vurgulu güncel fiyat ve sağ üst köşede indirim oranı rozeti.
 *
 * Yalnızca sunumdan sorumludur — hangi sayının nereden geldiği, nasıl
 * biçimlendirildiği ve hangi tonda çizileceği çağıranın işidir. Böylece indirimli
 * tekil ürün ile paket toplamı aynı görsel dili tek bir yerden paylaşır.
 */
export function DiscountPriceBox({
  accessibilityLabel,
  discountRate,
  layout = 'inline',
  maxFontSizeMultiplier,
  priceLabel,
  previousPriceLabel,
  scale = 1,
  testID,
  tone = 'discount',
}: DiscountPriceBoxProps) {
  const previousPriceType = PREVIOUS_PRICE_TYPE[layout];

  return (
    <PriceBoxFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      accessible
      layout={layout}
      testID={testID}
      tone={tone}
    >
      <PriceLines layout={layout} testID={testID ? `${testID}-lines` : undefined}>
        {previousPriceLabel ? (
          <Paragraph
            color="$color10"
            fontSize={previousPriceType.fontSize}
            fontWeight="600"
            lineHeight={Math.round(previousPriceType.lineHeight * scale)}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            paddingRight={layout === 'stacked' ? STACKED_BADGE_CLEARANCE : 0}
            textDecorationLine="line-through"
          >
            {previousPriceLabel}
          </Paragraph>
        ) : null}
        <Paragraph
          color={PRICE_COLOR[tone]}
          fontSize={20}
          fontWeight="900"
          letterSpacing={-0.5}
          lineHeight={Math.round(24 * scale)}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
        >
          {priceLabel}
        </Paragraph>
      </PriceLines>

      <DiscountRateBadge
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        position="absolute"
        rate={discountRate}
        right={-8}
        size="sm"
        top={-10}
      />
    </PriceBoxFrame>
  );
}
