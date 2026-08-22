import { Image } from 'expo-image';
import { Check } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BundleItem } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';

const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 86;
const LOW_STOCK_THRESHOLD = 3;
/** Beden butonunun en küçük dokunma hedefi (mobil erişilebilirlik alt sınırı). */
const SIZE_CHIP_MIN_HEIGHT = 44;
const SIZE_CHIP_MIN_WIDTH = 52;

export type BundleItemRowProps = {
  item: BundleItem;
  /** Paketteki sıra numarası (1, 2, 3…). */
  index: number;
  selectedVariantId?: string;
  onSelectVariant: (bundleItemId: number, variantId: string) => void;
  /** Beden seçilmediği için vurgulanacak mı? */
  isMissing: boolean;
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
}: BundleItemRowProps) {
  const selectedVariant = item.variants.find((variant) => variant.variantId === selectedVariantId);
  const hasStock = item.variants.some((variant) => variant.hasStock);

  const borderColor = isMissing ? '$red8' : selectedVariant ? '$brand' : '$borderColor';
  const backgroundColor = isMissing ? '$red2' : '$background';

  return (
    <YStack
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      padding="$2.5"
    >
      <XStack gap="$2.5">
        {/* Sıra numarası + görsel */}
        <YStack position="relative">
          <YStack
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$3"
            borderWidth={1}
            height={IMAGE_HEIGHT}
            overflow="hidden"
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
            {item.price > 0 ? (
              <Paragraph color="$color10" fontSize={13} fontWeight="700">
                {formatCurrency(item.price)}
              </Paragraph>
            ) : null}
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
          {!hasStock ? (
            <Paragraph color="$red10" fontSize={11} fontWeight="700">
              Bu ürün tükendi
            </Paragraph>
          ) : selectedVariant ? (
            <XStack alignItems="center" gap="$1" marginTop={2}>
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
      </XStack>
    </YStack>
  );
}
