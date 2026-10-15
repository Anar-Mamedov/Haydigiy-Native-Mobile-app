import React from 'react';
import { Table, Calculator, Bell } from '@/components/ui/icons';
import { XStack, YStack, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Pressable } from 'react-native';
import { DiscountRateBadge } from '@/components/ui/discount-rate-badge';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { TextActionButton } from '@/components/ui/text-action-button';
import { FeatureIcon, ProductVariant } from '@/types/product.types';
import { COMPACT_MAX_FONT_SCALE, useFontScale } from '@/lib/theme/font-scale';
import { type ProductBasePricing, resolveVariantDiscountRate } from '../utils/variant-price';
import { ProductFeatureDescriptionList } from './product-feature-tags';
import { ProductSizeSelectorSkeleton } from './product-size-skeleton';
import { ProductSaleNotice } from './product-sale-notice';

/** İndirim rozetinin beden çipinin sağ üst köşesinden taşma payı (webdeki beden butonuyla aynı). */
const DISCOUNT_BADGE_OFFSET_TOP = -8;
const DISCOUNT_BADGE_OFFSET_RIGHT = -6;

/**
 * Tükenmiş bedenin yazı ve zil rengi. Beden yine basılabilir (gelince haber ver), bu yüzden soluk
 * görünse de okunur kalmalı: eski #9CA3AF/#4B5563 beyaz/koyu zeminde 2.5:1 / 2.4:1 kalıyordu;
 * bunlar 4.8:1 / 7:1. Tükendiği üstü çizili yazı ve çapraz çizgiyle zaten anlaşılıyor.
 */
const UNAVAILABLE_SIZE_TEXT_COLOR = '#6B7280';
const UNAVAILABLE_SIZE_TEXT_COLOR_DARK = '#9CA3AF';

interface ProductSizeSelectorProps {
  variants?: ProductVariant[];
  /**
   * Ürünün bedene özel olmayan fiyatı ve indirim öncesi fiyatı. Verilirse, bundan ucuza satılan ve
   * alınabilen bedenin köşesinde, o beden seçilince fiyat kutusunda görünecek toplam indirim
   * rozeti ("%24") gösterilir.
   */
  productPricing?: ProductBasePricing;
  featureIcons?: FeatureIcon[];
  isLoading?: boolean;
  isApprovedForSale?: boolean;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onSizeChartPress?: () => void;
  onSizeCalculatorPress?: () => void;
}

export function ProductSizeSelector({
  variants = [],
  productPricing,
  featureIcons,
  isLoading = false,
  isApprovedForSale = true,
  selectedVariant,
  onSelectVariant,
  onSizeChartPress,
  onSizeCalculatorPress,
}: ProductSizeSelectorProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');
  // Çipler sabit ölçülü; yazı ile kutu birlikte büyümeli.
  const scale = useFontScale(COMPACT_MAX_FONT_SCALE);
  const chipHeight = Math.round(40 * scale);
  const chipMinWidth = Math.round(52 * scale);
  const bellBadgeSize = Math.round(18 * scale);
  // Çip 40dp görünür; basılabilir kutu 48dp'ye tamamlanır ve çip kutunun ortasında durur.
  const chipTouchInset = Math.max(0, (MIN_TOUCH_TARGET - chipHeight) / 2);
  const unavailableSizeColor = isDark ? UNAVAILABLE_SIZE_TEXT_COLOR_DARK : UNAVAILABLE_SIZE_TEXT_COLOR;

  if (isLoading) return <ProductSizeSelectorSkeleton />;

  if (!variants || variants.length === 0) return null;

  return (
    <YStack gap="$3" paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$background">
      {/* Header with Title & Sizing helpers. Bağlantıların dokunma alanı 48dp; başlık satırı yine yazı
          kadar yer kaplasın diye kutunun şeffaf payı üstteki/alttaki boşluğa taşar (negatif dikey marj). */}
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2" marginVertical="$-3">
        <Paragraph fontSize={14} fontWeight="700" color="$color">
          Beden
        </Paragraph>

        <XStack gap="$3" alignItems="center">
          {onSizeChartPress && (
            <TextActionButton
              color="$color10"
              fontSize={11}
              fontWeight="600"
              icon={<Table size={14} color="$color10" />}
              label="Beden Tablosu"
              onPress={onSizeChartPress}
            />
          )}

          {onSizeCalculatorPress && (
            <TextActionButton
              color="$brand"
              fontSize={11}
              fontWeight="600"
              icon={<Calculator size={14} color="$brand" />}
              label="Bedenimi hesapla"
              onPress={onSizeCalculatorPress}
            />
          )}
        </XStack>
      </XStack>

      {/* Wrapped Sizes Grid Row */}
      {/* Basılabilir kutular 48dp ve çipler içlerinde ortalı: satırlar arası boşluğu kutuların şeffaf
          payı verir, bu yüzden dikey boşluk (rowGap) sıfır. */}
      <XStack columnGap="$2" flexWrap="wrap" rowGap={0} width="100%">
        {variants.map((variant) => {
          const isSelected = isApprovedForSale && selectedVariant?.id === variant.id;
          const isAvailable = isApprovedForSale && variant.hasStock && variant.quantity > 0;
          // Rozet yalnızca alınabilen bedende: tükenmiş ya da satışa kapalı bedende indirim vaat edilmez.
          const discountRate = isAvailable ? resolveVariantDiscountRate(variant.price, productPricing) : undefined;
          const discountLabel = discountRate !== undefined ? `, yüzde ${discountRate} indirimli` : '';

          return (
            <Pressable
              key={variant.id}
              // Satışa açık ürünlerde tükenen bedenler stok bildirimi için seçilebilir.
              disabled={!isApprovedForSale}
              onPress={() => onSelectVariant(variant)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isApprovedForSale, selected: isSelected }}
              accessibilityLabel={`Beden ${variant.name}${discountLabel} ${!isApprovedForSale ? 'satışa kapalı' : isAvailable ? 'seçilebilir' : 'stokta yok, gelince haber ver'}`}
              style={({ pressed }) => ({
                justifyContent: 'center',
                minHeight: MIN_TOUCH_TARGET,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <YStack
                height={chipHeight}
                minWidth={chipMinWidth}
                paddingHorizontal={8}
                borderRadius={6}
                borderWidth={1}
                borderColor={
                  isAvailable
                    ? isSelected
                      ? '$brand'
                      : (isDark ? '#4B5563' : '#D1D5DB')
                    : isSelected
                      ? '$brand'
                      : (isDark ? '#374151' : '#E5E7EB')
                }
                backgroundColor={
                  isAvailable
                    ? isSelected
                      ? '$brand'
                      : (isDark ? '#1F2937' : 'white')
                    : (isDark ? '#111827' : 'white')
                }
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
              >
                <Paragraph
                  fontSize={13}
                  fontWeight="700"
                  maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                  numberOfLines={1}
                  color={
                    !isApprovedForSale
                      ? '$color10'
                      : isAvailable
                        ? isSelected
                          ? 'white'
                          : (isDark ? '#E5E7EB' : '#1F2937')
                        : isSelected
                          ? '$brand'
                          : unavailableSizeColor
                  }
                  style={{
                    textDecorationLine: isAvailable ? 'none' : 'line-through',
                  }}
                >
                  {variant.name}
                  {variant.name2 ? ` (${variant.name2})` : ''}
                </Paragraph>

                {/* Diagonal Line and Bell Badge for Out of Stock */}
                {!isAvailable && (
                  <>
                    {/* Diagonal line */}
                    <YStack
                      position="absolute"
                      top={0}
                      bottom={0}
                      left="48%"
                      width={1.5}
                      backgroundColor={isDark ? '#4B5563' : '#D1D5DB'}
                      style={{ transform: [{ rotate: '45deg' }] }}
                    />
                    {/* Bell icon badge */}
                    <XStack
                      position="absolute"
                      top={1}
                      right={1}
                      backgroundColor={isDark ? '#111827' : 'white'}
                      borderRadius={10}
                      borderWidth={0.5}
                      borderColor={isDark ? '#374151' : '#E5E7EB'}
                      width={bellBadgeSize}
                      height={bellBadgeSize}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Bell color={unavailableSizeColor} maxFontScale={COMPACT_MAX_FONT_SCALE} size={10} />
                    </XStack>
                  </>
                )}
              </YStack>

              {/* Çip çapraz çizgi için taşmayı kırptığından rozet çipin kardeşi olarak Pressable'a
                  yerleşir ve köşeden taşar (webdeki beden butonuyla aynı). */}
              <DiscountRateBadge
                maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                pointerEvents="none"
                position="absolute"
                rate={discountRate}
                right={DISCOUNT_BADGE_OFFSET_RIGHT}
                size="xs"
                testID={`size-discount-badge-${variant.id}`}
                top={chipTouchInset + DISCOUNT_BADGE_OFFSET_TOP}
              />
            </Pressable>
          );
        })}
      </XStack>

      <ProductSaleNotice isApprovedForSale={isApprovedForSale} />
      <ProductFeatureDescriptionList featureIcons={featureIcons} gap="$1.5" />
    </YStack>
  );
}
