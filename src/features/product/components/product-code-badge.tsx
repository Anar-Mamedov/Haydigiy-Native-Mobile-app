import { Paragraph, XStack } from 'tamagui';

type ProductCodeBadgeProps = {
  code: string;
  /** Distance from the top of the screen content (header height + offset). */
  top: number;
  right?: number;
};

/**
 * Pinned product-code badge shown over the product image, mirroring the web
 * `MobileProductDetailModal` badge. A translucent dark scrim with white text is
 * used deliberately for reliable contrast over arbitrary product photography in
 * both light and dark themes (matches the web `bg-black/70`).
 */
export function ProductCodeBadge({ code, top, right = 16 }: ProductCodeBadgeProps) {
  return (
    <XStack
      position="absolute"
      top={top}
      right={right}
      backgroundColor="rgba(0,0,0,0.7)"
      paddingHorizontal={8}
      paddingVertical={4}
      borderRadius={4}
      pointerEvents="none"
      zIndex={20}
      accessibilityRole="text"
      accessibilityLabel={`Ürün kodu: ${code}`}
    >
      <Paragraph color="white" fontSize={12} fontWeight="700">
        {code}
      </Paragraph>
    </XStack>
  );
}
