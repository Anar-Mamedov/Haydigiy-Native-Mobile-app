import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Truck } from '@/components/ui/icons';
import { Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { FeatureIcon, ProductVariant } from '@/types/product.types';
import { resolveProductActionState } from '../utils/product-action-state';
import { ProductFeatureDescriptionList } from './product-feature-tags';
import { ProductDetailDiscountPrice } from './product-price';
import { resolveProductDiscount } from '../utils/product-price';
import { ProductSizeSkeletonGrid } from './product-size-skeleton';
import { ProductSaleNotice } from './product-sale-notice';

type SizeSelectionSheetProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  imageUrl: string;
  /** Already-formatted price label, e.g. "349,99 TL". Used when the product has no discount. */
  priceLabel: string;
  /** Ham fiyat; yalnızca indirimli düzen için gerekir. */
  price?: number;
  /** Backend indirim bayrağı (`has_discount`). */
  hasDiscount?: boolean;
  /** İndirim yüzdesi (`discount_rate`). */
  discountRate?: number;
  /** İndirim öncesi fiyat (`first_price`). */
  firstPrice?: number;
  shippingMessage?: string;
  featureIcons?: FeatureIcon[];
  variants: ProductVariant[];
  isLoadingVariants?: boolean;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onConfirm: () => void;
  onAskQuestion?: () => void;
  isApprovedForSale?: boolean;
  isNotified?: boolean;
  isNotifying?: boolean;
  onNotifyMe?: () => void;
};

/**
 * Bottom sheet for choosing a size before adding to cart, mirroring the web
 * "Bedeninizi seçin" modal. Opened when the user taps "Sepete Ekle" without a
 * selected variant (used by the detail, reviews and Q&A screens).
 */
export function SizeSelectionSheet({
  open,
  onClose,
  productName,
  imageUrl,
  priceLabel,
  price,
  hasDiscount,
  discountRate,
  firstPrice,
  shippingMessage,
  featureIcons,
  variants,
  isLoadingVariants = false,
  selectedVariant,
  onSelectVariant,
  onConfirm,
  onAskQuestion,
  isApprovedForSale = true,
  isNotified = false,
  isNotifying = false,
  onNotifyMe,
}: SizeSelectionSheetProps) {
  const insets = useSafeAreaInsets();
  const discount = resolveProductDiscount({
    discountRate,
    firstPrice,
    hasDiscount,
    price: price ?? 0,
  });

  const isSelectedVariantOutOfStock = Boolean(
    selectedVariant && (!selectedVariant.hasStock || selectedVariant.quantity < 1),
  );
  const actionState = resolveProductActionState({
    isApprovedForSale,
    isNotified,
    isOutOfStock: isSelectedVariantOutOfStock,
  });
  const canAdd = isApprovedForSale && !isLoadingVariants && Boolean(selectedVariant) && !isSelectedVariantOutOfStock;

  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={(next: boolean) => !next && onClose()}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <YStack gap="$3" padding="$4" paddingBottom={Math.max(insets.bottom, 16)}>
          {/* Product + price + shipping */}
          <XStack gap="$3">
            {imageUrl ? (
              <Image contentFit="cover" source={{ uri: imageUrl }} style={{ width: 72, height: 96, borderRadius: 8 }} />
            ) : null}
            <YStack flex={1} gap="$1.5" justifyContent="center">
              <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
                {productName}
              </Paragraph>
              {discount.isDiscounted ? (
                <ProductDetailDiscountPrice
                  discountRate={discountRate}
                  firstPrice={firstPrice}
                  hasDiscount={hasDiscount}
                  price={price ?? 0}
                  testID="size-selection-sheet-discount-price"
                />
              ) : (
                <Paragraph color="$brand" fontSize={20} fontWeight="800">
                  {priceLabel}
                </Paragraph>
              )}
              {shippingMessage ? (
                <XStack alignItems="center" gap="$1.5">
                  <Truck color="$brand" size={14} />
                  <Paragraph color="$color10" flex={1} fontSize={12} numberOfLines={2}>
                    {shippingMessage}
                  </Paragraph>
                </XStack>
              ) : null}
            </YStack>
          </XStack>

          <YStack gap="$1">
            <Paragraph color="$color" fontSize={16} fontWeight="800">
              Bedeninizi seçin
            </Paragraph>
            {isApprovedForSale ? (
              <Paragraph color="$color10" fontSize={12}>
                Sepete eklemek için bir beden seçin
              </Paragraph>
            ) : null}
          </YStack>

          <YStack gap="$2">
            <XStack flexWrap="wrap" gap="$2">
              {isLoadingVariants ? (
                <ProductSizeSkeletonGrid
                  itemBorderRadius={8}
                  itemBorderWidth={2}
                  itemHeight={44}
                  itemMinWidth={64}
                />
              ) : (
                variants.map((variant) => {
                  const available = isApprovedForSale && variant.hasStock && variant.quantity > 0;
                  const selected = isApprovedForSale && selectedVariant?.id === variant.id;
                  return (
                    <XStack
                      accessibilityLabel={
                        !isApprovedForSale
                          ? `Beden ${variant.name} satışa kapalı`
                          : available
                          ? `Beden ${variant.name}`
                          : `Beden ${variant.name} stokta yok, gelince haber ver`
                      }
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !isApprovedForSale, selected }}
                      alignItems="center"
                      backgroundColor={selected && available ? '$brand' : '$background'}
                      borderColor={selected ? '$brand' : '$borderColor'}
                      borderRadius="$3"
                      borderWidth={2}
                      disabled={!isApprovedForSale}
                      justifyContent="center"
                      key={variant.id}
                      minWidth={64}
                      // Satışa açık ürünlerde tükenen bedenler stok bildirimi için seçilebilir.
                      onPress={isApprovedForSale ? () => onSelectVariant(variant) : undefined}
                      opacity={available ? 1 : 0.6}
                      paddingHorizontal="$3"
                      paddingVertical="$2.5"
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <Paragraph
                        color={!isApprovedForSale ? '$color10' : selected && available ? 'white' : selected ? '$brand' : '$color'}
                        fontSize={14}
                        fontWeight="600"
                        textDecorationLine={available ? 'none' : 'line-through'}
                      >
                        {variant.name}
                        {variant.name2 ? ` (${variant.name2})` : ''}
                      </Paragraph>
                    </XStack>
                  );
                })
              )}
            </XStack>

            <ProductSaleNotice isApprovedForSale={isApprovedForSale} />
            <ProductFeatureDescriptionList featureIcons={featureIcons} />
          </YStack>

          {onAskQuestion ? (
            <Pressable onPress={onAskQuestion}>
              <Paragraph color="$color10" fontSize={12} textAlign="center">
                Aklına takılan bir şey mi var?{' '}
                <Paragraph color="$brand" fontSize={12} fontWeight="600">
                  Soru sor
                </Paragraph>
              </Paragraph>
            </Pressable>
          ) : null}

          <YStack gap="$2">
            {actionState === 'notify-requested' ? (
              <AppButton
                accessibilityLabel="Stok bildirimi talebin alındı"
                backgroundColor="$green10"
                borderColor="transparent"
                color="white"
                disabled
                icon={Bell}
                testID="sheet-notify-requested"
              >
                Talebini Aldık
              </AppButton>
            ) : actionState === 'notify-available' ? (
              <AppButton
                accessibilityLabel="Ürün gelince haber ver"
                backgroundColor="$background"
                borderColor="$brand"
                borderWidth={1}
                color="$brand"
                disabled={isNotifying}
                icon={Bell}
                onPress={onNotifyMe}
                opacity={isNotifying ? 0.6 : 1}
                pressStyle={{ opacity: 0.85 }}
                testID="sheet-notify-me"
              >
                {isNotifying ? 'Gönderiliyor...' : 'Gelince Haber Ver'}
              </AppButton>
            ) : (
              <AppButton
                backgroundColor={isApprovedForSale ? '$brand' : '$color4'}
                borderColor="transparent"
                color={isApprovedForSale ? 'white' : '$color10'}
                disabled={!canAdd}
                opacity={canAdd ? 1 : 0.5}
                onPress={canAdd ? onConfirm : undefined}
                pressStyle={{ opacity: 0.85 }}
              >
                Sepete Ekle
              </AppButton>
            )}
            <AppButton backgroundColor="$backgroundHover" borderColor="$borderColor" borderWidth={1} color="$color" onPress={onClose}>
              Vazgeç
            </AppButton>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
