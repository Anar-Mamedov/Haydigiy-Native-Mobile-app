import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { RANKING_BADGE_GRADIENT } from '@/lib/theme/colors';
import { FeatureIcon } from '@/types/product.types';

const FEATURE_TAG_ROTATION_MS = 3000;

/** Rozetler arası geçişin çapraz geçiş (cross-fade) süresi. */
const FEATURE_TAG_TRANSITION_MS = 300;

/** Backend hiçbir konum göndermediğinde rozetin varsayıldığı köşe. */
const DEFAULT_TAG_POSITION = 'top-left';

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

/**
 * Backend'in rozet için işaretlediği konum: önce `positionHint`, o boşsa
 * `position`. İkisi de gelmezse rozet sol üst kabul edilir.
 */
export function getFeatureTagPosition(icon: FeatureIcon): string {
  return icon.positionHint?.trim() || icon.position?.trim() || DEFAULT_TAG_POSITION;
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
  // Bu ticker rozeti her zaman sabit bir sol üst noktaya çizer, dolayısıyla
  // backend'in başka bir köşeye işaretlediği ikonlar rotasyona alınmaz; alınsaydı
  // `top-right` için gönderilen bir etiket sol üstte görünürdü.
  const icons = useMemo(
    () =>
      getOrderedFeatureIcons(featureIcons).filter(
        (icon) => hasValue(icon.assetUrl) && getFeatureTagPosition(icon) === DEFAULT_TAG_POSITION,
      ),
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
        // Tek rozet varsa geçiş yok: ilk boyamada gereksiz bir solma yaşanmasın.
        transition={icons.length > 1 ? FEATURE_TAG_TRANSITION_MS : 0}
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
  /** Sıralama rozeti metni; özellik açıklamalarının ardından, son sırada döner. */
  rankingText?: string | null;
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

/**
 * Bir ticker satırının arka planı: özellik açıklamaları backend'den düz renk
 * alırken sıralama rozeti gradyanla çizilir.
 */
export type TickerBackground =
  | { type: 'color'; color: string }
  | { type: 'gradient'; colors: readonly [string, string, ...string[]] };

export type DescriptionTickerItem = {
  id: string;
  text: string;
  background: TickerBackground | null;
};

/** Sıralama rozeti satırının sabit kimliği. */
export const RANKING_TICKER_ITEM_ID = 'ranking-text';

const RANKING_TICKER_PREFIX = '🏅';

/**
 * Ticker'da dönecek satırları üretir: önce backend sırasındaki özellik
 * açıklamaları, en sonda `rankingText` rozeti. Backend rozet için bir arka plan
 * rengi göndermediğinden rozet her zaman marka gradyanıyla çizilir.
 */
export function buildDescriptionTickerItems(
  featureIcons: FeatureIcon[] | undefined,
  rankingText?: string | null,
): DescriptionTickerItem[] {
  const items: DescriptionTickerItem[] = [];

  getOrderedFeatureIcons(featureIcons).forEach((icon, index) => {
    const description = icon.description?.trim();
    if (!description) return;

    items.push({
      id: `${icon.id}-${index}`,
      text: description,
      background: hasValue(icon.descriptionBgColor)
        ? { type: 'color', color: icon.descriptionBgColor.trim() }
        : null,
    });
  });

  if (hasValue(rankingText)) {
    items.push({
      id: RANKING_TICKER_ITEM_ID,
      text: `${RANKING_TICKER_PREFIX} ${rankingText.trim()}`,
      background: { type: 'gradient', colors: RANKING_BADGE_GRADIENT },
    });
  }

  return items;
}

export function ProductFeatureDescriptionTicker({
  featureIcons,
  rankingText,
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
  const items = useMemo(
    () => buildDescriptionTickerItems(featureIcons, rankingText),
    [featureIcons, rankingText],
  );
  const activeItem = items[useRotatingFeatureIndex(items.length)];

  if (!activeItem) return null;

  const background = activeItem.background;

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
      style={{ backgroundColor: background?.type === 'color' ? background.color : undefined }}
      testID={testID}
      width={width}
    >
      {background?.type === 'gradient' ? (
        // Gradyan, satırın düzenini bozmamak için metnin arkasına serilir; böylece
        // hizalama/dolgu propları tek bir kapsayıcıda kalır.
        <LinearGradient
          colors={background.colors}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
          testID={`${testID}-gradient`}
        />
      ) : null}

      <Paragraph
        color={background ? 'white' : '$color'}
        fontSize={fontSize}
        fontWeight="700"
        lineHeight={lineHeight}
        numberOfLines={numberOfLines}
        textAlign="center"
        zIndex={1}
      >
        {activeItem.text}
      </Paragraph>
    </XStack>
  );
}
