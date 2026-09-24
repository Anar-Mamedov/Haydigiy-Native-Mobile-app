import { Image } from 'expo-image';
import { Check } from '@/components/ui/icons';
import { getTokenValue, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { getBundleItemSavings } from '@/features/bundle/bundle.savings';
import { BundleItem } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';
import { BundleBuySingleButton } from './bundle-buy-single-button';
import { BundleItemPrice } from './bundle-item-price';

// Görsel; beden şeridi ve "Tekli Satın Al" aksiyonuyla dengeli dursun diye webdeki kompakt satırla
// aynı ölçüdedir (72 genişlik, 1.35 oran).
const IMAGE_WIDTH = 72;
const IMAGE_HEIGHT = 97;
const LOW_STOCK_THRESHOLD = 3;
/** Beden butonunun en küçük dokunma hedefi (mobil erişilebilirlik alt sınırı). */
const SIZE_CHIP_MIN_HEIGHT = 44;
const SIZE_CHIP_MIN_WIDTH = 52;
/** Kartın iç boşluğu; "Tekli Satın Al" sekmesi bu boşluğu negatif marjla geri alıp sağ alt köşeye yaslanır. */
const CARD_PADDING = '$2.5';

export type BundleItemRowProps = {
  item: BundleItem;
  /** Paketteki sıra numarası (1, 2, 3…). */
  index: number;
  selectedVariantId?: string;
  onSelectVariant: (bundleItemId: number, variantId: string) => void;
  /** Beden seçilmediği için vurgulanacak mı? */
  isMissing: boolean;
  /**
   * Görsele dokunulunca çağrılır (ürün detayına gitmek için). Verilmezse ya da kalemin slug'ı
   * yoksa görsel tıklanmaz. Rota kararı çağırana aittir.
   */
  onOpenProduct?: (item: BundleItem) => void;
  /**
   * "Tekli Satın Al"a basılınca çağrılır: beden seçiliyse kalem tek başına sepete eklenir, değilse
   * ürün detayı açılır. Karar çağırana aittir; verilmezse buton gösterilmez.
   */
  onBuySingle?: (item: BundleItem) => void;
  /** Bu kalemin tekli sepete ekleme isteği sürüyor mu? Buton yükleniyor gösterir ve basılamaz. */
  isBuyingSingle?: boolean;
  /** Kalem az önce tek başına sepete eklendi mi? Buton kısa süre "Tekli Ürün Eklendi" yazar. */
  isAddedSingle?: boolean;
};

/**
 * Paketteki tek bir ürün: görsel, ad, fiyat ve kendi beden şeridi.
 * Her kalem kendi bedenini ayrı seçer; paket ancak hepsi seçilince sepete eklenir.
 */
export function BundleItemRow({
  item,
  index,
  selectedVariantId,
  onSelectVariant,
  isMissing,
  onOpenProduct,
  onBuySingle,
  isBuyingSingle = false,
  isAddedSingle = false,
}: BundleItemRowProps) {
  const selectedVariant = item.variants.find((variant) => variant.variantId === selectedVariantId);
  const hasStock = item.variants.some((variant) => variant.hasStock);
  // Slug yoksa gidilecek ürün sayfası yok; görsel tıklanmaz.
  const canOpenProduct = Boolean(onOpenProduct && item.slug);
  const openProduct = () => onOpenProduct?.(item);
  // Tükenmiş kalem tek başına alınamaz; bedeni seçilmemiş ve sayfası olmayan kalemde de butonun
  // yapacağı bir şey kalmaz. Webdeki gibi buton yine görünür ama gri ve basılamaz olur.
  const canBuySingle = hasStock && Boolean(selectedVariant || item.slug);
  const buySingle = () => onBuySingle?.(item);
  const itemSavings = getBundleItemSavings(item);
  const cardPadding = getTokenValue(CARD_PADDING, 'space');

  const borderColor = isMissing ? '$red8' : selectedVariant ? '$brand' : '$borderColor';
  // Seçili kalem webdeki gibi hafif turuncu zemine geçer; `$orange2` her iki temada da uyumlu tondur.
  const backgroundColor = isMissing ? '$red2' : selectedVariant ? '$orange2' : '$background';

  return (
    <YStack
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      overflow="hidden"
      padding={CARD_PADDING}
    >
      <XStack gap="$2.5">
        {/* Sıra numarası + görsel */}
        <YStack position="relative">
          <YStack
            accessibilityHint={canOpenProduct ? 'Ürün detayına gider' : undefined}
            accessibilityLabel={canOpenProduct ? `${item.title} ürün detayı` : undefined}
            accessibilityRole={canOpenProduct ? 'button' : undefined}
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$3"
            borderWidth={1}
            height={IMAGE_HEIGHT}
            onPress={canOpenProduct ? openProduct : undefined}
            overflow="hidden"
            pressStyle={canOpenProduct ? { opacity: 0.7 } : undefined}
            width={IMAGE_WIDTH}
          >
            <Image
              contentFit="contain"
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
            />
          </YStack>
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius="$10"
            height={20}
            justifyContent="center"
            left={-4}
            position="absolute"
            top={-4}
            width={20}
          >
            <Paragraph color="white" fontSize={11} fontWeight="800">
              {index}
            </Paragraph>
          </XStack>
        </YStack>

        <YStack flex={1} gap="$1">
          <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
            <Paragraph color="$color" flex={1} fontSize={13} fontWeight="700" numberOfLines={2}>
              {item.title}
            </Paragraph>
            <BundleItemPrice oldPrice={item.oldPrice} price={item.price} />
          </XStack>

          {item.quantity > 1 ? (
            <Paragraph color="$color10" fontSize={11} fontWeight="600">
              Pakette {item.quantity} adet
            </Paragraph>
          ) : null}

          {/* Beden şeridi */}
          {item.variants.length > 0 ? (
            <XStack flexWrap="wrap" gap="$1.5" marginTop="$1">
              {item.variants.map((variant) => {
                const selected = variant.variantId === selectedVariantId;
                return (
                  <XStack
                    accessibilityLabel={
                      variant.hasStock
                        ? `${item.title} için beden ${variant.name}`
                        : `${item.title} için beden ${variant.name}, tükendi`
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: !variant.hasStock }}
                    alignItems="center"
                    backgroundColor={
                      !variant.hasStock ? '$backgroundHover' : selected ? '$brand' : '$background'
                    }
                    borderColor={selected ? '$brand' : '$borderColor'}
                    borderRadius="$3"
                    borderWidth={2}
                    disabled={!variant.hasStock}
                    justifyContent="center"
                    key={variant.key}
                    minHeight={SIZE_CHIP_MIN_HEIGHT}
                    minWidth={SIZE_CHIP_MIN_WIDTH}
                    onPress={() => variant.hasStock && onSelectVariant(item.bundleItemId, variant.variantId)}
                    opacity={variant.hasStock ? 1 : 0.5}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1.5"
                    pressStyle={variant.hasStock ? { opacity: 0.7 } : undefined}
                  >
                    <Paragraph
                      color={selected && variant.hasStock ? 'white' : '$color'}
                      fontSize={12}
                      fontWeight="700"
                      textDecorationLine={variant.hasStock ? 'none' : 'line-through'}
                    >
                      {variant.name}
                      {variant.name2 ? ` (${variant.name2})` : ''}
                    </Paragraph>
                  </XStack>
                );
              })}
            </XStack>
          ) : (
            <Paragraph color="$color10" fontSize={11}>
              Beden bilgisi bulunamadı
            </Paragraph>
          )}

          {/* Durum satırı */}
          <YStack>
            {!hasStock ? (
              <Paragraph color="$red10" fontSize={11} fontWeight="700">
                Bu ürün tükendi
              </Paragraph>
            ) : selectedVariant ? (
              <XStack alignItems="center" flexWrap="wrap" gap="$1" marginTop={2}>
                <Check color="$green10" size={12} />
                <Paragraph color="$green10" fontSize={11} fontWeight="700">
                  {selectedVariant.name} bedeni seçildi
                </Paragraph>
                {selectedVariant.stock > 0 && selectedVariant.stock <= LOW_STOCK_THRESHOLD ? (
                  <Paragraph color="$red10" fontSize={11} fontWeight="800">
                    Son {selectedVariant.stock} ürün!
                  </Paragraph>
                ) : null}
              </XStack>
            ) : (
              <Paragraph color={isMissing ? '$red10' : '$color10'} fontSize={11} fontWeight="700" marginTop={2}>
                Beden seçiniz
              </Paragraph>
            )}
          </YStack>

          {itemSavings > 0 ? (
            <Paragraph color="$discount" fontSize={11} fontWeight="600" lineHeight={15}>
              Ürünü pakette alırsan {formatCurrency(itemSavings)} indirim kazanırsın.
            </Paragraph>
          ) : null}

          {/*
            "Tekli Satın Al" sekmesi webdeki gibi kartın sağ alt köşesine yaslanır. Kendi satırında durur;
            böylece durum metni ve tasarruf notu tam genişlikte kalır, butonun uzayan yazısıyla sıkışmaz.
            marginTop="auto", görsel sütunu daha uzun olduğunda da sekmeyi kartın dibine indirir.
          */}
          {onBuySingle ? (
            <XStack
              justifyContent="flex-end"
              marginBottom={-cardPadding}
              marginRight={-cardPadding}
              marginTop="auto"
              paddingTop="$2"
            >
              <BundleBuySingleButton
                disabled={!canBuySingle}
                hasSelectedSize={Boolean(selectedVariant)}
                isAdded={isAddedSingle}
                isBuying={isBuyingSingle}
                itemTitle={item.title}
                onBuy={buySingle}
              />
            </XStack>
          ) : null}
        </YStack>
      </XStack>
    </YStack>
  );
}
