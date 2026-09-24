import { Spinner } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Paragraph } from '@/components/ui/app-paragraph';

/** Sekme webdeki gibi 36pt görünür; dokunma alanı üstten ve soldan taşarak 44pt'ye tamamlanır. */
const HIT_SLOP = { top: 8, left: 8 };

export type BuySingleLabelState = {
  /** Kalem az önce tek başına sepete eklendi mi? */
  isAdded: boolean;
  /** Kalemin bedeni seçildi mi? */
  hasSelectedSize: boolean;
};

/**
 * Butonun yazısı webdekiyle aynı sırayla belirlenir: az önce eklendiyse onay, beden seçiliyse
 * doğrudan sepete ekleme, değilse (beden ürün sayfasında seçilecek) satın alma daveti.
 */
export function resolveBuySingleLabel({ isAdded, hasSelectedSize }: BuySingleLabelState): string {
  if (isAdded) return 'Tekli Ürün Eklendi';
  if (hasSelectedSize) return 'Tekli Sepete Ekle';
  return 'Tekli Satın Al';
}

export type BundleBuySingleButtonProps = BuySingleLabelState & {
  /** Ekran okuyucu etiketinde kullanılan kalem adı. */
  itemTitle: string;
  /** İstek sürüyor mu? Yazı yerine yükleniyor göstergesi çıkar ve basılamaz. */
  isBuying: boolean;
  /** Tükenmiş ya da gidilecek sayfası olmayan kalemde buton gri ve basılamaz görünür. */
  disabled: boolean;
  /** Basılınca çağrılır; sepete ekleme ya da ürün detayına gitme kararı çağırana aittir. */
  onBuy: () => void;
};

/**
 * Paket kalemindeki "Tekli Satın Al" sekmesi: kartın sağ alt köşesine yaslanan, yalnızca sol
 * üst köşesi yuvarlak buton. Kalemi paketsiz almayı sunar; ne yapacağına çağıran karar verir.
 */
export function BundleBuySingleButton({
  itemTitle,
  hasSelectedSize,
  isAdded,
  isBuying,
  disabled,
  onBuy,
}: BundleBuySingleButtonProps) {
  const label = resolveBuySingleLabel({ isAdded, hasSelectedSize });
  const isPressable = !disabled && !isBuying;
  // Görünen yazıyla aynı ad okunur; istek sürerken yazının yerini alan gösterge "Ekleniyor" diye okunur.
  const spokenLabel = isBuying ? 'Ekleniyor' : label;

  return (
    <AppButton
      accessibilityHint={
        isPressable
          ? hasSelectedSize
            ? 'Seçili bedeni tek başına sepete ekler'
            : 'Beden seçmek için ürün detayına gider'
          : undefined
      }
      accessibilityLabel={`${itemTitle}, ${spokenLabel}`}
      accessibilityState={{ busy: isBuying, disabled: !isPressable }}
      backgroundColor={disabled ? '$color4' : '$brand'}
      borderRadius={0}
      borderTopLeftRadius="$4"
      borderWidth={0}
      disabled={!isPressable}
      hitSlop={HIT_SLOP}
      onPress={isPressable ? onBuy : undefined}
      opacity={isBuying ? 0.7 : 1}
      paddingHorizontal="$3"
      pressStyle={{ opacity: 0.85 }}
      size="$3"
    >
      {isBuying ? (
        <Spinner color="white" size="small" testID="bundle-buy-single-spinner" />
      ) : (
        <Paragraph color={disabled ? '$color10' : 'white'} fontSize={14} fontWeight="600" numberOfLines={1}>
          {label}
        </Paragraph>
      )}
    </AppButton>
  );
}
