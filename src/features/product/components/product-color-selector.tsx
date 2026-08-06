import React from 'react';
import { ChevronRight } from '@/components/ui/icons';
import { XStack, YStack, ScrollView, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { ProductColorOption } from '@/types/product.types';

interface ProductColorSelectorProps {
  otherColors?: ProductColorOption[];
  currentProductId: string;
  currentProductSlug: string;
  currentProductImage: string;
  /** Receives the full option so the target screen can render an instant preview. */
  onColorSelect: (color: ProductColorOption) => void;
  categoryName?: string;
  categorySlug?: string;
  categoryId?: number;
  onCategoryPress?: (slug: string, id?: number) => void;
}

export function ProductColorSelector({
  otherColors = [],
  currentProductId,
  currentProductSlug,
  currentProductImage,
  onColorSelect,
  categoryName,
  categorySlug,
  categoryId,
  onCategoryPress,
}: ProductColorSelectorProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');
  // If no colors and no category redirection slug, hide component
  if ((!otherColors || otherColors.length === 0) && !categorySlug) {
    return null;
  }

  const hasColors = otherColors && otherColors.length > 0;
  const headerTitle = hasColors ? 'Renk' : 'Tüm Modeller';

  // Ensure current color option is included in selection list
  const hasCurrentColorInList = otherColors.some(
    (c) => String(c.id) === String(currentProductId) || c.slug === currentProductSlug
  );

  const allColorOptions = hasCurrentColorInList
    ? otherColors
    : [
        {
          id: currentProductId,
          name: 'Mevcut',
          slug: currentProductSlug,
          imageUrl: currentProductImage,
          price: 0,
          isStock: true,
        },
        ...otherColors,
      ];

  return (
    <YStack gap="$2" paddingHorizontal="$4" paddingVertical="$2" backgroundColor="$background">
      <Paragraph fontSize={14} fontWeight="700" color="$color">
        {headerTitle}
      </Paragraph>

      {/* Colors List */}
      {hasColors && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <XStack gap="$3" paddingVertical="$1">
            {allColorOptions.map((color) => {
              const isSelected =
                String(color.id) === String(currentProductId) || color.slug === currentProductSlug;

              return (
                <Pressable
                  key={color.id}
                  onPress={() => !isSelected && onColorSelect(color)}
                  accessibilityRole="button"
                  accessibilityLabel={`${color.name} renk seçeneği`}
                >
                  <YStack
                    borderWidth={2}
                    borderColor={isSelected ? '$brand' : '$borderColor'}
                    borderRadius={6}
                    overflow="hidden"
                    backgroundColor={isDark ? '#1F2937' : 'white'}
                    width={64}
                    height={90}
                    opacity={color.isStock === false ? 0.5 : 1}
                  >
                    <Image
                      source={{ uri: color.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="contain"
                    />
                    
                    {color.isStock === false && (
                      <YStack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        backgroundColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Paragraph fontSize={8} fontWeight="800" color="red" textAlign="center">
                          Tükendi
                        </Paragraph>
                      </YStack>
                    )}
                  </YStack>
                </Pressable>
              );
            })}
          </XStack>
        </ScrollView>
      )}

      {/* Integrated Category Redirection Button */}
      {categorySlug && (
        <Pressable
          onPress={() => onCategoryPress?.(categorySlug, categoryId)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            marginTop: 4,
          })}
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            borderColor={isDark ? 'rgba(242, 122, 26, 0.25)' : '#fed7aa'}
            borderWidth={1}
            backgroundColor={isDark ? 'rgba(242, 122, 26, 0.08)' : '#fff7ed'}
            borderRadius={8}
            paddingHorizontal={12}
            paddingVertical={10}
            gap={8}
          >
            <Paragraph fontSize={13} fontWeight="800" color={isDark ? '#fed7aa' : '#c45a08'}>
              Tüm {categoryName || 'Kategori'} modellerini gör
            </Paragraph>
            <ChevronRight size={16} color="$brand" />
          </XStack>
        </Pressable>
      )}
    </YStack>
  );
}
