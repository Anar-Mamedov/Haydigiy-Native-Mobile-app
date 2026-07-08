import { type GetProps, XStack, YStack } from 'tamagui';

const SKELETON_ITEMS = [0, 1, 2, 3];
type SkeletonBorderRadius = GetProps<typeof YStack>['borderRadius'];

type ProductSizeSkeletonGridProps = {
  itemHeight?: number;
  itemMinWidth?: number;
  itemBorderWidth?: number;
  itemBorderRadius?: SkeletonBorderRadius;
};

export function ProductSizeSkeletonGrid({
  itemHeight = 40,
  itemMinWidth = 52,
  itemBorderWidth = 1,
  itemBorderRadius = 6,
}: ProductSizeSkeletonGridProps) {
  return (
    <XStack
      accessibilityLabel="Beden seçenekleri yükleniyor"
      flexWrap="wrap"
      gap="$2"
      paddingVertical="$1"
      width="100%"
    >
      {SKELETON_ITEMS.map((item) => (
        <YStack
          backgroundColor="$color4"
          borderColor="$borderColor"
          borderRadius={itemBorderRadius}
          borderWidth={itemBorderWidth}
          height={itemHeight}
          key={item}
          minWidth={itemMinWidth}
          opacity={0.65}
        />
      ))}
    </XStack>
  );
}

export function ProductSizeSelectorSkeleton() {
  return (
    <YStack
      accessibilityLabel="Beden alanı yükleniyor"
      backgroundColor="$background"
      gap="$3"
      paddingHorizontal="$4"
      paddingVertical="$3"
    >
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <YStack backgroundColor="$color4" borderRadius={4} height={14} opacity={0.65} width={48} />
        <XStack alignItems="center" gap="$3">
          <YStack backgroundColor="$color4" borderRadius={4} height={12} opacity={0.55} width={84} />
          <YStack backgroundColor="$color4" borderRadius={4} height={12} opacity={0.55} width={96} />
        </XStack>
      </XStack>

      <ProductSizeSkeletonGrid />
    </YStack>
  );
}
