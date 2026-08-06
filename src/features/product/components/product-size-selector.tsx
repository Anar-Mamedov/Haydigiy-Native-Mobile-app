import React from 'react';
import { Table, Calculator, Bell } from '@tamagui/lucide-icons-2';
import { XStack, YStack, Paragraph, useThemeName } from 'tamagui';
import { Pressable } from 'react-native';
import { FeatureIcon, ProductVariant } from '@/types/product.types';
import { ProductFeatureDescriptionList } from './product-feature-tags';
import { ProductSizeSelectorSkeleton } from './product-size-skeleton';

interface ProductSizeSelectorProps {
  variants?: ProductVariant[];
  featureIcons?: FeatureIcon[];
  isLoading?: boolean;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onSizeChartPress?: () => void;
  onSizeCalculatorPress?: () => void;
}

export function ProductSizeSelector({
  variants = [],
  featureIcons,
  isLoading = false,
  selectedVariant,
  onSelectVariant,
  onSizeChartPress,
  onSizeCalculatorPress,
}: ProductSizeSelectorProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

  if (isLoading) return <ProductSizeSelectorSkeleton />;

  if (!variants || variants.length === 0) return null;

  return (
    <YStack gap="$3" paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$background">
      {/* Header with Title & Sizing helpers */}
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <Paragraph fontSize={14} fontWeight="700" color="$color">
          Beden
        </Paragraph>

        <XStack gap="$3" alignItems="center">
          {onSizeChartPress && (
            <Pressable onPress={onSizeChartPress}>
              <XStack alignItems="center" gap="$1">
                <Table size={14} color="$color10" />
                <Paragraph color="$color10" fontSize={11} fontWeight="600">
                  Beden Tablosu
                </Paragraph>
              </XStack>
            </Pressable>
          )}

          {onSizeCalculatorPress && (
            <Pressable onPress={onSizeCalculatorPress}>
              <XStack alignItems="center" gap="$1">
                <Calculator size={14} color="$brand" />
                <Paragraph color="$brand" fontSize={11} fontWeight="600">
                  Bedenimi hesapla
                </Paragraph>
              </XStack>
            </Pressable>
          )}
        </XStack>
      </XStack>

      {/* Wrapped Sizes Grid Row */}
      <XStack flexWrap="wrap" gap="$2" paddingVertical="$1" width="100%">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isAvailable = variant.hasStock && variant.quantity > 0;

          return (
            <Pressable
              key={variant.id}
              onPress={() => isAvailable && onSelectVariant(variant)}
              accessibilityRole="button"
              accessibilityLabel={`Beden ${variant.name} ${isAvailable ? 'seçilebilir' : 'stokta yok'}`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <YStack
                height={40}
                minWidth={52}
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
                  color={
                    isAvailable
                      ? isSelected
                        ? 'white'
                        : (isDark ? '#E5E7EB' : '#1F2937')
                      : isSelected
                        ? '$brand'
                        : (isDark ? '#4B5563' : '#9CA3AF')
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
                      width={18}
                      height={18}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Bell size={10} color={isDark ? '#6B7280' : '#9CA3AF'} />
                    </XStack>
                  </>
                )}
              </YStack>
            </Pressable>
          );
        })}
      </XStack>

      <ProductFeatureDescriptionList featureIcons={featureIcons} gap="$1.5" />
    </YStack>
  );
}
