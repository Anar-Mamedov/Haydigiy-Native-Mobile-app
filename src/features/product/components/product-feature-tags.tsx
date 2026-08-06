import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { FeatureIcon } from '@/types/product.types';

const FEATURE_TAG_ROTATION_MS = 3000;

function hasValue(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getFeatureOrder(icon: FeatureIcon, fallback: number) {
  const order = icon.displayOrder ?? icon.sortOrder;
  return typeof order === 'number' && Number.isFinite(order) ? order : fallback;
}

export function getOrderedFeatureIcons(featureIcons: FeatureIcon[] | undefined): FeatureIcon[] {
  if (!featureIcons?.length) return [];

  return featureIcons
    .map((icon, index) => ({ icon, index }))
    .sort((a, b) => {
      const orderDelta = getFeatureOrder(a.icon, a.index) - getFeatureOrder(b.icon, b.index);
      return orderDelta === 0 ? a.index - b.index : orderDelta;
    })
    .map(({ icon }) => icon);
}

function useRotatingFeatureIndex(total: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, FEATURE_TAG_ROTATION_MS);

    return () => clearInterval(interval);
  }, [total]);

  return total > 0 ? activeIndex % total : 0;
}

type ProductFeatureAssetTickerProps = {
  featureIcons?: FeatureIcon[];
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  zIndex?: number;
  testID?: string;
};

export function ProductFeatureAssetTicker({
  featureIcons,
  width = 76,
  height = 56,
  top = 12,
  left = 12,
  zIndex = 20,
  testID = 'product-feature-asset',
}: ProductFeatureAssetTickerProps) {
  const icons = useMemo(
    () => getOrderedFeatureIcons(featureIcons).filter((icon) => hasValue(icon.assetUrl)),
    [featureIcons],
  );
  const activeIcon = icons[useRotatingFeatureIndex(icons.length)];

  if (!activeIcon) return null;

  return (
    <YStack pointerEvents="none" position="absolute" top={top} left={left} zIndex={zIndex}>
      <Image
        accessibilityLabel={activeIcon.name ? `${activeIcon.name} ürün etiketi` : 'Ürün etiketi'}
        contentFit="contain"
        source={{ uri: activeIcon.assetUrl }}
        style={{ width, height }}
        testID={testID}
      />
    </YStack>
  );
}

type ProductFeatureDescriptionListProps = {
  featureIcons?: FeatureIcon[];
  fontSize?: number;
  lineHeight?: number;
  gap?: ComponentProps<typeof YStack>['gap'];
  testID?: string;
};

const DESCRIPTION_BULLET_SIZE = 6;

/**
 * Renders every feature description at once, stacked and static. Used where the
 * copy must stay readable (size sheet, size selector) instead of rotating like
 * {@link ProductFeatureDescriptionTicker}.
 */
export function ProductFeatureDescriptionList({
  featureIcons,
  fontSize = 13,
  lineHeight = 18,
  gap = '$1',
  testID = 'product-feature-description-list',
}: ProductFeatureDescriptionListProps) {
  const descriptions = useMemo(
    () => getOrderedFeatureIcons(featureIcons).filter((icon) => hasValue(icon.description)),
    [featureIcons],
  );

  if (descriptions.length === 0) return null;

  return (
    <YStack gap={gap} testID={testID}>
      {descriptions.map((icon, index) => (
        <XStack alignItems="flex-start" gap="$2" key={`${icon.id}-${index}`}>
          <YStack
            backgroundColor="$brand"
            borderRadius={DESCRIPTION_BULLET_SIZE / 2}
            height={DESCRIPTION_BULLET_SIZE}
            marginTop={(lineHeight - DESCRIPTION_BULLET_SIZE) / 2}
            width={DESCRIPTION_BULLET_SIZE}
          />
          <Paragraph color="$color" flex={1} fontSize={fontSize} fontWeight="700" lineHeight={lineHeight}>
            {icon.description?.trim()}
          </Paragraph>
        </XStack>
      ))}
    </YStack>
  );
}

type ProductFeatureDescriptionTickerProps = {
  featureIcons?: FeatureIcon[];
  width?: ComponentProps<typeof XStack>['width'];
  marginHorizontal?: number;
  marginTop?: number;
  marginBottom?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontSize?: number;
  lineHeight?: number;
  numberOfLines?: number;
  testID?: string;
};

export function ProductFeatureDescriptionTicker({
  featureIcons,
  width = '100%',
  marginHorizontal = 0,
  marginTop = 0,
  marginBottom = 0,
  paddingHorizontal = 16,
  paddingVertical = 10,
  fontSize = 13,
  lineHeight = 18,
  numberOfLines,
  testID = 'product-feature-description',
}: ProductFeatureDescriptionTickerProps) {
  const descriptions = useMemo(
    () => getOrderedFeatureIcons(featureIcons).filter((icon) => hasValue(icon.description)),
    [featureIcons],
  );
  const activeIcon = descriptions[useRotatingFeatureIndex(descriptions.length)];
  const description = activeIcon?.description?.trim();

  if (!activeIcon || !description) return null;

  return (
    <XStack
      alignItems="center"
      alignSelf="center"
      justifyContent="center"
      marginBottom={marginBottom}
      marginHorizontal={marginHorizontal}
      marginTop={marginTop}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      style={{ backgroundColor: activeIcon.descriptionBgColor ?? undefined }}
      testID={testID}
      width={width}
    >
      <Paragraph
        color={activeIcon.descriptionBgColor ? 'white' : '$color'}
        fontSize={fontSize}
        fontWeight="700"
        lineHeight={lineHeight}
        numberOfLines={numberOfLines}
        textAlign="center"
      >
        {description}
      </Paragraph>
    </XStack>
  );
}
