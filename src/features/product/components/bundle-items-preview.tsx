import { Image } from 'expo-image';
import { ChevronRight, Package } from '@/components/ui/icons';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
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
      backgroundColor="$background"
      borderColor="$brand"
      borderRadius="$5"
      borderWidth={1}
      gap="$2.5"
      marginHorizontal="$4"
      marginVertical="$2"
      onPress={onPress}
      padding="$3"
      pressStyle={{ opacity: 0.85 }}
    >
      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <XStack alignItems="center" flex={1} gap="$1.5">
          <Package color="$brand" size={16} />
          <Paragraph color="$color" fontSize={14} fontWeight="800">
            Bu paket {items.length} üründen oluşuyor
          </Paragraph>
        </XStack>
        <ChevronRight color="$brand" size={16} />
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2">
          {items.map((item) => (
            <YStack
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
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
          color={isSaleClosed ? '$color10' : isComplete ? '$green10' : '$brand'}
          flex={1}
          fontSize={12}
          fontWeight="700"
        >
          {statusLabel}
        </Paragraph>
        {summary.savings > 0 ? (
          <Paragraph color="$green10" fontSize={11} fontWeight="800">
            Pakette {formatCurrency(summary.savings)} kazanç
          </Paragraph>
        ) : null}
      </XStack>
    </YStack>
  );
}
