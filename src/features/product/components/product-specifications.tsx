import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/components/ui/icons';
import { XStack, YStack, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Pressable, Dimensions } from 'react-native';
import { ProductModel, ProductVariantOnModel } from '@/types/product.types';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 32 - 10) / 2;

interface Property {
  name: string;
  value: string;
}

interface ProductSpecificationsProps {
  properties?: Property[];
  model?: ProductModel | null;
  variantOnModel?: ProductVariantOnModel | null;
  categoryName?: string;
}

export function ProductSpecifications({
  properties = [],
  model,
  variantOnModel,
  categoryName = '',
}: ProductSpecificationsProps) {
  const [expanded, setExpanded] = useState(false);
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

  if (!properties || properties.length === 0) return null;

  const hasHiddenFeatures = properties.length > 2;
  const visibleProperties = expanded ? properties : properties.slice(0, 2);

  // Helper to chunk array into pairs for 2-column row layout
  const chunk = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };
  const propertyRows = chunk(visibleProperties, 2);

  // Excluded categories for mannequin details
  const isExcludedCategory = [
    'Çocuk Ayakkabı',
    'Erkek Aksesuar',
    'Erkek Ayakkabı',
    'Kadın Babet-Terlik-Sandalet',
    'Kadın Çanta',
    'Kadın Fantezi İç Giyim',
    'Kadın Gözlük',
    'Kadın Kemer',
    'Kadın Külot-Korse',
    'Kadın Parfüm',
    'Kadın Spor-Günlük Ayakkabı',
    'Kadın Sütyen-Takım',
    'Kadın Topuklu Ayakkabı',
  ].includes(categoryName);

  const showModelInfo = model && !isExcludedCategory;

  const hasModelMeasurements = model && [
    model.height,
    model.weight,
    model.chest,
    model.waist,
    model.hip
  ].some(val => {
    const norm = String(val ?? '').trim();
    return norm !== '' && norm !== '0';
  });

  const hasGorselBeden = variantOnModel?.name && 
    String(variantOnModel.name).trim() !== '' && 
    String(variantOnModel.name).trim() !== '0' && 
    String(variantOnModel.name).trim() !== '00';

  const hasMankenBeden = model?.model_body && 
    String(model.model_body).trim() !== '' && 
    String(model.model_body).trim() !== '0';

  return (
    <YStack gap="$2.5" padding="$4" backgroundColor="$background" borderTopWidth={8} borderTopColor="$color3">
      {/* Title & Expand/Collapse Row */}
      <XStack alignItems="center" justifyContent="space-between">
        <Paragraph fontSize={15} fontWeight="700" color="$color">
          Öne Çıkan Özellikler:
        </Paragraph>
        {hasHiddenFeatures && (
          <Pressable onPress={() => setExpanded(!expanded)}>
            <XStack alignItems="center" gap="$1">
              <Paragraph color="$brand" fontSize={12} fontWeight="700">
                {expanded ? 'Daha Az Göster' : 'Devamını Gör'}
              </Paragraph>
              {expanded ? (
                <ChevronUp size={14} color="$brand" />
              ) : (
                <ChevronDown size={14} color="$brand" />
              )}
            </XStack>
          </Pressable>
        )}
      </XStack>

      <Paragraph fontSize={11} color="$color10" marginTop={-4}>
        Bu ölçüler en küçük bedene aittir.
      </Paragraph>

      {/* Grid of Highlight Cards in Rows of 2 */}
      <YStack gap="$2.5" width="100%">
        {propertyRows.map((row, rowIndex) => (
          <XStack key={rowIndex} gap="$2.5" width="100%">
            {row.map((item, itemIndex) => (
              <YStack
                key={itemIndex}
                flex={1}
                backgroundColor={isDark ? 'rgba(242, 122, 26, 0.08)' : '#fff7ed'}
                borderColor={isDark ? 'rgba(242, 122, 26, 0.25)' : '#fed7aa'}
                borderWidth={1}
                borderRadius={12}
                padding="$3"
                gap="$0.5"
                minHeight={84}
                justifyContent="center"
              >
                <Paragraph fontSize={11} color="#ea580c" fontWeight="600" numberOfLines={2}>
                  {item.name}
                </Paragraph>
                <Paragraph fontSize={14} fontWeight="700" color="$color" numberOfLines={2}>
                  {item.value}
                </Paragraph>
              </YStack>
            ))}
            {/* If the row has only 1 item and overall count is > 1, render an empty spacer of the same flex to keep 50% width alignment */}
            {row.length === 1 && visibleProperties.length > 1 && (
              <YStack flex={1} opacity={0} pointerEvents="none" />
            )}
          </XStack>
        ))}

        {/* Tüm özellikleri göster Button below the rows */}
        {hasHiddenFeatures && !expanded && (
          <Pressable
            onPress={() => setExpanded(true)}
            style={({ pressed }) => ({
              width: '100%',
              marginTop: 4,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$2"
              borderRadius={12}
              borderWidth={1}
              borderColor={isDark ? 'rgba(242, 122, 26, 0.25)' : '#fed7aa'}
              backgroundColor={isDark ? '#1F2937' : 'white'}
              paddingVertical={12}
            >
              <Paragraph fontSize={14} fontWeight="500" color="$brand">
                Tüm özellikleri göster
              </Paragraph>
              <ChevronDown size={16} color="$brand" />
            </XStack>
          </Pressable>
        )}
      </YStack>

      {/* Model & Mannequin Details */}
      {(hasGorselBeden || hasMankenBeden || hasModelMeasurements) && showModelInfo && (
        <YStack gap="$3" marginTop="$3" paddingLeft="$1">
          {hasGorselBeden && (
            <XStack alignItems="flex-start" gap="$2.5">
              <YStack width={6} height={6} borderRadius={3} backgroundColor="$brand" marginTop={6} />
              <Paragraph fontSize={13} color="$color11" flex={1}>
                Görseldeki Ürünün Bedeni: <Paragraph fontWeight="700" color="$color">{String(variantOnModel.name).trim()}</Paragraph>
              </Paragraph>
            </XStack>
          )}

          {hasMankenBeden && (
            <XStack alignItems="flex-start" gap="$2.5">
              <YStack width={6} height={6} borderRadius={3} backgroundColor="$brand" marginTop={6} />
              <Paragraph fontSize={13} color="$color11" flex={1}>
                Mankenin Kendi Bedeni: <Paragraph fontWeight="700" color="$color">{String(model.model_body).trim()}</Paragraph>
              </Paragraph>
            </XStack>
          )}

          {hasModelMeasurements && (
            <XStack alignItems="flex-start" gap="$2.5">
              <YStack width={6} height={6} borderRadius={3} backgroundColor="$brand" marginTop={6} />
              <Paragraph fontSize={13} color="$color11" flex={1} lineHeight={18}>
                Modelin Ölçüleri:{' '}
                <Paragraph fontWeight="700" color="$color">
                  Boy: {model.height && String(model.height).trim() !== '0' ? `${model.height} cm` : '-'}
                  {', '}Kilo: {model.weight && String(model.weight).trim() !== '0' ? `${model.weight} kg` : '-'}
                  {', '}Göğüs: {model.chest && String(model.chest).trim() !== '0' ? `${model.chest} cm` : '-'}
                  {', '}Bel: {model.waist && String(model.waist).trim() !== '0' ? `${model.waist} cm` : '-'}
                  {', '}Kalça: {model.hip && String(model.hip).trim() !== '0' ? `${model.hip} cm` : '-'}
                </Paragraph>
              </Paragraph>
            </XStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}
