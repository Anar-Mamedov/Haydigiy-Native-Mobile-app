import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, ShoppingBag, Truck } from '@/components/ui/icons';
import { ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { BundleItem, BundleSummary } from '@/types/bundle.types';
import { BundleItemRow } from './bundle-item-row';
import { BundlePriceSummary } from './bundle-price-summary';

const LIST_MAX_HEIGHT = 380;

export type BundleSelectionSheetProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  imageUrl: string;
  shippingMessage?: string;
  items: BundleItem[];
  summary: BundleSummary;
  selections: Record<number, string>;
  onSelectVariant: (bundleItemId: number, variantId: string) => void;
  missingItemIds: number[];
  missingHighlight: boolean;
  selectedCount: number;
  isComplete: boolean;
  isPurchasable: boolean;
  isAdding?: boolean;
  onConfirm: () => void;
};

function resolveActionLabel(params: {
  isAdding: boolean;
  isSaleClosed: boolean;
  isPurchasable: boolean;
  isComplete: boolean;
  remainingCount: number;
}): string {
  if (params.isAdding) return 'Ekleniyor...';
  if (params.isSaleClosed) return 'Satışa Kapalı';
  if (!params.isPurchasable) return 'Paket Tükendi';
  if (!params.isComplete) return `${params.remainingCount} ürün için beden seçin`;
  return 'Paketi Sepete Ekle';
}

/**
 * Bundle için beden seçim alt sayfası — normal ürünlerdeki `SizeSelectionSheet`'in
 * paket karşılığı. Paketteki HER ürün için ayrı beden seçilir; hepsi seçilmeden
 * sepete ekleme yapılmaz. Eksik seçimle butona basmak eksik kalemleri vurgular.
 */
export function BundleSelectionSheet({
  open,
  onClose,
  productName,
  imageUrl,
  shippingMessage,
  items,
  summary,
  selections,
  onSelectVariant,
  missingItemIds,
  missingHighlight,
  selectedCount,
  isComplete,
  isPurchasable,
  isAdding = false,
  onConfirm,
}: BundleSelectionSheetProps) {
  const insets = useSafeAreaInsets();

  const isSaleClosed = !summary.isSellable;
  const progressRatio = items.length > 0 ? selectedCount / items.length : 0;
  const actionLabel = resolveActionLabel({
    isAdding,
    isSaleClosed,
    isPurchasable,
    isComplete,
    remainingCount: missingItemIds.length,
  });

  // Eksik beden varken buton tıklanabilir kalır: basınca eksik kalemler vurgulanır.
  const canConfirm = !isAdding && !isSaleClosed && isPurchasable;

  const helperText = isSaleClosed
    ? 'Bu paket şu an satışa kapalı.'
    : isComplete
      ? 'Tüm bedenler seçildi, paketi sepete ekleyebilirsiniz.'
      : 'Sepete eklemek için paketteki her ürün için beden seçin.';

  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={(next: boolean) => !next && onClose()}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <YStack gap="$3" padding="$4" paddingBottom={Math.max(insets.bottom, 16)}>
          {/* Paket başlığı */}
          <XStack gap="$3">
            {imageUrl ? (
              <Image
                contentFit="cover"
                source={{ uri: imageUrl }}
                style={{ width: 64, height: 84, borderRadius: 8 }}
              />
            ) : null}
            <YStack flex={1} gap="$1" justifyContent="center">
              <XStack
                alignSelf="flex-start"
                backgroundColor="$brand"
                borderRadius="$10"
                paddingHorizontal="$2"
                paddingVertical={2}
              >
                <Paragraph color="white" fontSize={10} fontWeight="800">
                  PAKET ÜRÜN
                </Paragraph>
              </XStack>
              <Paragraph color="$color" fontSize={14} fontWeight="700" numberOfLines={2}>
                {productName}
              </Paragraph>
              {shippingMessage ? (
                <XStack alignItems="center" gap="$1.5">
                  <Truck color="$brand" size={14} />
                  <Paragraph color="$color10" flex={1} fontSize={12} numberOfLines={2}>
                    {shippingMessage}
                  </Paragraph>
                </XStack>
              ) : null}
            </YStack>
          </XStack>

          {/* İlerleme */}
          <YStack gap="$1.5">
            <XStack alignItems="center" gap="$2" justifyContent="space-between">
              <XStack alignItems="center" flex={1} gap="$1.5">
                <Package color="$brand" size={16} />
                <Paragraph color="$color" fontSize={15} fontWeight="800">
                  Paket İçeriği
                </Paragraph>
                <YStack backgroundColor="$backgroundHover" borderRadius="$10" paddingHorizontal="$2" paddingVertical={1}>
                  <Paragraph color="$brand" fontSize={11} fontWeight="800">
                    {items.length} ürün
                  </Paragraph>
                </YStack>
              </XStack>
              <Paragraph
                color={isComplete && !isSaleClosed ? '$green10' : '$color10'}
                fontSize={11}
                fontWeight="800"
              >
                {selectedCount}/{items.length} beden seçildi
              </Paragraph>
            </XStack>

            <YStack backgroundColor="$backgroundHover" borderRadius="$10" height={6} overflow="hidden">
              <YStack
                backgroundColor={isSaleClosed ? '$color8' : isComplete ? '$green10' : '$brand'}
                height={6}
                width={`${Math.max(progressRatio * 100, 4)}%`}
              />
            </YStack>

            <Paragraph color="$color10" fontSize={11}>
              {helperText}
            </Paragraph>
          </YStack>

          {/* Paket kalemleri */}
          <ScrollView maxHeight={LIST_MAX_HEIGHT} showsVerticalScrollIndicator={false}>
            <YStack gap="$2">
              {items.map((item, index) => (
                <BundleItemRow
                  index={index + 1}
                  isMissing={missingHighlight && missingItemIds.includes(item.bundleItemId)}
                  item={item}
                  key={item.bundleItemId}
                  onSelectVariant={onSelectVariant}
                  selectedVariantId={selections[item.bundleItemId]}
                />
              ))}
            </YStack>
          </ScrollView>

          <BundlePriceSummary summary={summary} />

          {isSaleClosed ? (
            <Paragraph color="$red10" fontSize={12} fontWeight="600">
              Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.
            </Paragraph>
          ) : null}

          <YStack gap="$2">
            <AppButton
              accessibilityLabel={actionLabel}
              backgroundColor={canConfirm ? '$brand' : '$color4'}
              borderColor="transparent"
              color={canConfirm ? 'white' : '$color10'}
              disabled={!canConfirm}
              icon={ShoppingBag}
              onPress={onConfirm}
              opacity={canConfirm ? 1 : 0.7}
              pressStyle={{ opacity: 0.85 }}
              testID="bundle-add-to-cart"
            >
              {actionLabel}
            </AppButton>
            <AppButton
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderWidth={1}
              color="$color"
              onPress={onClose}
            >
              Vazgeç
            </AppButton>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
