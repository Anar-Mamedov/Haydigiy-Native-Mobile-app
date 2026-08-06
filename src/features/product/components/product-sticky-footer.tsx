import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { TrendingDown } from '@tamagui/lucide-icons-2';
import { XStack, Paragraph, useTheme } from 'tamagui';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductPrimaryAction } from './product-primary-action';

const FOOTER_TOP_PADDING = 14;
const FOOTER_BOTTOM_PADDING = 14;
const FOOTER_ACTION_HEIGHT = 46;
const FOOTER_SCROLL_GAP = 18;

export const PRODUCT_STICKY_FOOTER_SCROLL_PADDING =
  FOOTER_TOP_PADDING + FOOTER_ACTION_HEIGHT + FOOTER_BOTTOM_PADDING + FOOTER_SCROLL_GAP;

interface ProductStickyFooterProps {
  price: number;
  originalPrice?: number;
  onAddToCart: () => void;
  onNotifyMe: () => void;
  onWhatsappPress: () => void;
  isApprovedForSale?: boolean;
  isAuthenticated?: boolean;
  isLastOne?: boolean;
  isNotified?: boolean;
  isNotifying?: boolean;
  /** Seçili bedenin stoğu bittiğinde birincil aksiyon bildirim talebine döner. */
  isOutOfStock?: boolean;
}

function WhatsappIcon({ color = '#25D366', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512" fill={color}>
      <Path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.3-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z" />
    </Svg>
  );
}

export function ProductStickyFooter({
  price,
  originalPrice,
  onAddToCart,
  onNotifyMe,
  onWhatsappPress,
  isApprovedForSale = true,
  isAuthenticated = false,
  isLastOne = false,
  isNotified = false,
  isNotifying = false,
  isOutOfStock = false,
}: ProductStickyFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const shadowColor = theme.shadowColor?.val ?? theme.color.val;

  const showDiscount = originalPrice && originalPrice > price;

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
      {/* Price tag (left side) inside a rounded light-orange box */}
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
        <Paragraph fontSize={30} fontWeight="900" color="$brand" lineHeight={34} letterSpacing={-0.5}>
          {Number(price).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).replace(/\s*TL\s*$/, '')}
        </Paragraph>
        <Paragraph fontSize={16} fontWeight="700" color="$brand" lineHeight={20}>
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

      {/* Buttons: WhatsApp & primary action */}
      <XStack flex={1} gap="$2.5" justifyContent="flex-end" alignItems="center">
        <ProductPrimaryAction
          height={FOOTER_ACTION_HEIGHT}
          isApprovedForSale={isApprovedForSale}
          isAuthenticated={isAuthenticated}
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
          <WhatsappIcon size={34} color="#25D366" />
        </Pressable>
      </XStack>
    </XStack>
  );
}
