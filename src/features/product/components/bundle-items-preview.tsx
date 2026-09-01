import { Image } from 'expo-image';
import { ChevronRight, Package } from '@/components/ui/icons';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { DiscountRateBadge } from '@/components/ui/discount-rate-badge';
import { resolveBundleSavings } from '@/features/bundle/bundle.savings';
import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';

const THUMB_WIDTH = 52;
const THUMB_HEIGHT = 68;

export type BundleItemsPreviewProps = {
  items: BundleItem[];
  summary: BundleSummary;
  /** Kaç ürünün bedeni seçildi. */
  selectedCount: number;
  onPress: () => void;
};

/**
 * Ürün detayının gövdesinde paketin özeti: içindeki ürünlerin küçük görselleri,
 * kazanç bilgisi ve beden seçimini açan satır. Asıl seçim `BundleSelectionSheet`
 * içinde yapılır — bu kart yalnızca paketin ne olduğunu görünür kılar.
 */
export function BundleItemsPreview({ items, summary, selectedCount, onPress }: BundleItemsPreviewProps) {
  if (items.length === 0) return null;

  const isSaleClosed = !summary.isSellable;
  const isComplete = selectedCount === items.length;
  const { discountRate, hasSavings } = resolveBundleSavings(summary);

  const statusLabel = isSaleClosed
    ? 'Bu paket şu an satışa kapalı'
    : isComplete
      ? 'Bedenler seçildi — sepete ekleyebilirsiniz'
      : `Bedenleri seç (${selectedCount}/${items.length})`;

  return (
    <YStack
      accessibilityHint="Paketteki ürünler için beden seçmek üzere açar"
      accessibilityLabel={`Paket içeriği, ${items.length} ürün`}
      accessibilityRole="button"
      accessible
      backgroundColor="$discountBackground"
      borderColor="$discount"
      borderRadius="$5"
      borderWidth={1}
      gap="$2.5"
      marginHorizontal="$4"
      marginVertical="$2"
      onPress={onPress}
      padding="$3"
      position="relative"
      pressStyle={{ opacity: 0.85 }}
    >
      <DiscountRateBadge
        position="absolute"
        rate={discountRate}
        right={-10}
        testID="bundle-preview-discount-badge"
        top={-10}
        zIndex={1}
      />

      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <XStack alignItems="center" flex={1} gap="$1.5">
          <Package color="$discount" size={16} />
          <Paragraph color="$color" fontSize={14} fontWeight="800">
            Bu paket {items.length} üründen oluşuyor
          </Paragraph>
        </XStack>
        <ChevronRight color="$discount" size={16} />
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {items.map((item) => (
            <YStack
              backgroundColor="$backgroundHover"
              borderColor="$green5"
              borderRadius="$3"
              borderWidth={1}
              height={THUMB_HEIGHT}
              key={item.bundleItemId}
              overflow="hidden"
              width={THUMB_WIDTH}
            >
              <Image
                contentFit="contain"
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: '100%' }}
              />
            </YStack>
          ))}
        </XStack>
      </ScrollView>

      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <Paragraph
          color={isSaleClosed ? '$color10' : isComplete ? '$discount' : '$brand'}
          flex={1}
          fontSize={12}
          fontWeight="700"
        >
          {statusLabel}
        </Paragraph>
        {hasSavings ? (
          <XStack
            backgroundColor="$savingsBadge"
            borderRadius={6}
            flexShrink={0}
            paddingHorizontal="$2"
            paddingVertical={3}
          >
            <Paragraph color="white" fontSize={11} fontWeight="800">
              Pakette {formatCurrency(summary.savings)} kazanç
            </Paragraph>
          </XStack>
        ) : null}
      </XStack>
    </YStack>
  );
}
