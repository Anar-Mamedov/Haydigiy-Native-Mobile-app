import React, { useState } from 'react';
import { WashingMachine } from '@/components/ui/icons';
import { XStack, YStack, Button, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image } from 'expo-image';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { TextActionButton } from '@/components/ui/text-action-button';
import { SizeMeasurementsTable } from './size-measurements-table';
import { SizeMeasurement } from '@/types/product.types';

type Property = Readonly<{
  name: string;
  value: string;
}>;

type MobileProductInformationProps = Readonly<{
  productData: Readonly<{
    description: string;
    imageUrl: string;
  }>;
  properties?: readonly Property[];
  sizeMeasurements?: SizeMeasurement[];
  onWashingInstructionsPress?: () => void;
}>;

const DESCRIPTION_PREVIEW_HEIGHT = 72;

function getPropertyKey(property: Property) {
  return `${property.name}:${property.value}`;
}

/**
 * Açıklama ve özellik listesini açıp kapatan "DAHA FAZLA / DAHA AZ GÖSTER" bağlantısı. Dokunma alanı
 * 48dp; bölüm yine yazı kadar uzasın diye kutunun şeffaf payı komşu boşluklara taşar (negatif marj).
 */
function ShowMoreToggle({ expanded, onPress }: { expanded: boolean; onPress: () => void }) {
  return (
    <YStack marginVertical="$-3" testID="product-information-show-more">
      <TextActionButton
        accessibilityState={{ expanded }}
        alignSelf="flex-start"
        color="$brand"
        iconAfter={
          <Paragraph color="$brand" fontSize={11} style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
            ↓
          </Paragraph>
        }
        label={expanded ? 'DAHA AZ GÖSTER' : 'DAHA FAZLA GÖSTER'}
        onPress={onPress}
      />
    </YStack>
  );
}

export function MobileProductInformation({
  productData,
  properties = [],
  sizeMeasurements,
  onWashingInstructionsPress,
}: MobileProductInformationProps) {
  const [showMore, setShowMore] = useState(false);
  const themeName = useThemeName();
  const isDark = String(themeName).includes('dark');

  const description = productData.description.trim();
  const hasDescription = description.length > 0;
  const hasProperties = properties.length > 0;
  const hasSizeMeasurements = Array.isArray(sizeMeasurements) && sizeMeasurements.length > 0;

  if (!hasDescription && !hasProperties && !hasSizeMeasurements) {
    return null;
  }

  return (
    <YStack gap="$4" padding="$4" backgroundColor="$background" borderTopWidth={8} borderTopColor="$color3">
      {/* Product Description Section */}
      {hasDescription && (
        <YStack gap="$3" paddingBottom="$1">
          <Paragraph fontSize={15} fontWeight="700" color="$color">
            Ürün Açıklaması
          </Paragraph>

          <YStack gap="$3">
            {/* Product Thumbnail */}
            {productData.imageUrl ? (
              <XStack>
                <Image
                  source={{ uri: productData.imageUrl }}
                  style={{ width: 80, height: 108, borderRadius: 8 }}
                  contentFit="cover"
                />
              </XStack>
            ) : null}

            {/* Expand / Collapse Button for Description */}
            <ShowMoreToggle expanded={showMore} onPress={() => setShowMore(!showMore)} />
          </YStack>

          {/* Description Text */}
          <YStack maxHeight={showMore ? undefined : DESCRIPTION_PREVIEW_HEIGHT} overflow="hidden" marginTop="$1">
            <MarkdownContent>{description}</MarkdownContent>
          </YStack>
        </YStack>
      )}

      {/* Product Specifications Section */}
      {hasProperties && (
        <YStack gap="$3" borderTopWidth={hasDescription ? 1 : 0} borderTopColor="$borderColor" paddingTop={hasDescription ? "$4" : 0}>
          <Paragraph fontSize={15} fontWeight="700" color="$color">
            Ürün Özellikleri
          </Paragraph>

          <YStack gap="$2">
            {properties.slice(0, showMore ? undefined : 6).map((property) => (
              <XStack
                key={getPropertyKey(property)}
                justifyContent="space-between"
                alignItems="center"
                paddingVertical="$3"
                paddingHorizontal="$3.5"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$background"
              >
                <Paragraph fontSize={12} color="$color10" fontWeight="600">
                  {property.name}
                </Paragraph>
                <Paragraph fontSize={12} fontWeight="700" color="$color" textAlign="right">
                  {property.value}
                </Paragraph>
              </XStack>
            ))}
          </YStack>

          {properties.length > 6 && (
            <ShowMoreToggle expanded={showMore} onPress={() => setShowMore(!showMore)} />
          )}
        </YStack>
      )}

      {/* Size Measurements Table */}
      <SizeMeasurementsTable measurements={sizeMeasurements} />

      {/* Washing Instructions Card Button */}
      {onWashingInstructionsPress && (
        <Button
          backgroundColor={isDark ? '#1F2937' : 'white'}
          borderColor="$borderColor"
          borderWidth={2}
          borderRadius={8}
          height={MIN_TOUCH_TARGET}
          onPress={onWashingInstructionsPress}
          icon={<WashingMachine size={18} color="$brand" />}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          marginTop="$2"
        >
          <Paragraph fontSize={13} fontWeight="700" color="$color">
            Yıkama Talimatları
          </Paragraph>
        </Button>
      )}
    </YStack>
  );
}
