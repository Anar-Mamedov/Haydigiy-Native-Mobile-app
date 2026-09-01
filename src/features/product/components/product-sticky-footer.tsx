import React from 'react';
import { TrendingDown } from '@/components/ui/icons';
import { XStack, useTheme } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { WhatsappIcon } from '@/components/ui/whatsapp-icon';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COMPACT_MAX_FONT_SCALE, useFontScale } from '@/lib/theme/font-scale';
import { BundleSummary } from '@/types/bundle.types';
import { BundleStickyPrice } from './bundle-sticky-price';
import { ProductPrimaryAction } from './product-primary-action';
import { ProductDetailDiscountPrice } from './product-price';
import { formatProductPriceAmount, resolveProductDiscount } from '../utils/product-price';

const FOOTER_TOP_PADDING = 14;
const FOOTER_BOTTOM_PADDING = 14;
const FOOTER_ACTION_HEIGHT = 46;
const FOOTER_SCROLL_GAP = 18;

export const PRODUCT_STICKY_FOOTER_SCROLL_PADDING =
  FOOTER_TOP_PADDING + FOOTER_ACTION_HEIGHT + FOOTER_BOTTOM_PADDING + FOOTER_SCROLL_GAP;

interface ProductStickyFooterProps {
  /** Paket ürünlerde footer, genel ürün fiyatı yerine bu özeti gösterir. */
  bundleSummary?: BundleSummary | null;
  price: number;
  originalPrice?: number;
  /** Backend indirim bayrağı; indirimli fiyat kutusunu açar. */
  hasDiscount?: boolean;
  /** İndirim yüzdesi (`discount_rate`). */
  discountRate?: number;
  /** İndirim öncesi fiyat (`first_price`); üstü çizili gösterilir. */
  firstPrice?: number;
  onAddToCart: () => void;
  onNotifyMe: () => void;
  onWhatsappPress: () => void;
  isApprovedForSale?: boolean;
  isLastOne?: boolean;
  isNotified?: boolean;
  isNotifying?: boolean;
  /** Seçili bedenin stoğu bittiğinde birincil aksiyon bildirim talebine döner. */
  isOutOfStock?: boolean;
}

export function ProductStickyFooter({
  bundleSummary,
  price,
  originalPrice,
  hasDiscount,
  discountRate,
  firstPrice,
  onAddToCart,
  onNotifyMe,
  onWhatsappPress,
  isApprovedForSale = true,
  isLastOne = false,
  isNotified = false,
  isNotifying = false,
  isOutOfStock = false,
}: ProductStickyFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const shadowColor = theme.shadowColor?.val ?? theme.color.val;
  // Footer yüksekliği sabit; fiyat ve aksiyon sıkı oranla büyüsün.
  const scale = useFontScale(COMPACT_MAX_FONT_SCALE);
  const actionHeight = Math.round(FOOTER_ACTION_HEIGHT * scale);

  const discount = resolveProductDiscount({ discountRate, firstPrice, hasDiscount, price });
  const showDiscount = originalPrice !== undefined && originalPrice > price;

  return (
    <XStack
      testID="product-sticky-footer"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      paddingHorizontal="$3.5"
      paddingTop={FOOTER_TOP_PADDING}
      paddingBottom={insets.bottom + FOOTER_BOTTOM_PADDING}
      justifyContent="space-between"
      alignItems="center"
      gap="$3.5"
      zIndex={100}
      elevation={15}
      shadowColor={shadowColor as any}
      shadowOffset={{ width: 0, height: -4 }}
      shadowOpacity={0.08}
      shadowRadius={6}
    >
      {/* Paket gerçek paket toplamını; normal ürün indirimli ya da standart fiyatını gösterir. */}
      {bundleSummary ? (
        <BundleStickyPrice
          maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
          scale={scale}
          summary={bundleSummary}
        />
      ) : discount.isDiscounted ? (
        <ProductDetailDiscountPrice
          discountRate={discountRate}
          firstPrice={firstPrice}
          hasDiscount={hasDiscount}
          maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
          price={price}
          scale={scale}
          testID="product-sticky-footer-discount-price"
        />
      ) : (
        <XStack
          position="relative"
          alignItems="center"
          borderColor="$orange5"
          borderWidth={1}
          backgroundColor="$orange2"
          borderRadius={8}
          paddingHorizontal={12}
          paddingVertical={8}
          gap={4}
        >
          <Paragraph fontSize={30} fontWeight="900" color="$brand" lineHeight={Math.round(34 * scale)} letterSpacing={-0.5} maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}>
            {formatProductPriceAmount(price)}
          </Paragraph>
          <Paragraph fontSize={16} fontWeight="700" color="$brand" lineHeight={Math.round(20 * scale)} maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}>
            TL
          </Paragraph>

          {/* Floating Orange Discount Badge */}
          {showDiscount && (
            <XStack
              position="absolute"
              top={-8}
              right={-8}
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor="$brand"
              alignItems="center"
              justifyContent="center"
              shadowColor={shadowColor as any}
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.2}
              shadowRadius={1.5}
              elevation={2}
            >
              <TrendingDown size={10} color="white" strokeWidth={3} />
            </XStack>
          )}
        </XStack>
      )}

      {/* Buttons: WhatsApp & primary action */}
      <XStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center">
        <ProductPrimaryAction
          height={actionHeight}
          isApprovedForSale={isApprovedForSale}
          isLastOne={isLastOne}
          isNotified={isNotified}
          isNotifying={isNotifying}
          isOutOfStock={isOutOfStock}
          onAddToCart={onAddToCart}
          onNotifyMe={onNotifyMe}
        />

        {/* WhatsApp Support Button */}
        <Pressable
          onPress={onWhatsappPress}
          style={({ pressed }) => ({
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.75 : 1,
          })}
          accessibilityLabel="WhatsApp ile sipariş ve destek"
          accessibilityRole="button"
        >
          <WhatsappIcon size={34} />
        </Pressable>
      </XStack>
    </XStack>
  );
}
