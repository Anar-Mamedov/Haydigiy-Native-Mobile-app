import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck } from '@tamagui/lucide-icons-2';
import { Paragraph, Sheet, XStack, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { ProductVariant } from '@/types/product.types';
import { ProductSizeSkeletonGrid } from './product-size-skeleton';

type SizeSelectionSheetProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  imageUrl: string;
  /** Already-formatted price label, e.g. "349,99 TL". */
  priceLabel: string;
  shippingMessage?: string;
  variants: ProductVariant[];
  isLoadingVariants?: boolean;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  onConfirm: () => void;
  onAskQuestion?: () => void;
};

/**
 * Bottom sheet for choosing a size before adding to cart, mirroring the web
 * "Bedeninizi seçin" modal. Opened when the user taps "Sepete Ekle" without a
 * selected variant (used by the detail, reviews and Q&A screens).
 */
export function SizeSelectionSheet({
  open,
  onClose,
  productName,
  imageUrl,
  priceLabel,
  shippingMessage,
  variants,
  isLoadingVariants = false,
  selectedVariant,
  onSelectVariant,
  onConfirm,
  onAskQuestion,
}: SizeSelectionSheetProps) {
  const canAdd = !isLoadingVariants && Boolean(selectedVariant) && (selectedVariant?.quantity ?? 0) > 0;
  const insets = useSafeAreaInsets();

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
          {/* Product + price + shipping */}
          <XStack gap="$3">
            {imageUrl ? (
              <Image contentFit="cover" source={{ uri: imageUrl }} style={{ width: 72, height: 96, borderRadius: 8 }} />
            ) : null}
            <YStack flex={1} gap="$1.5" justifyContent="center">
              <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
                {productName}
              </Paragraph>
              <Paragraph color="$brand" fontSize={20} fontWeight="800">
                {priceLabel}
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

          <YStack gap="$1">
            <Paragraph color="$color" fontSize={16} fontWeight="800">
              Bedeninizi seçin
            </Paragraph>
            <Paragraph color="$color10" fontSize={12}>
              Sepete eklemek için bir beden seçin
            </Paragraph>
          </YStack>

          <XStack flexWrap="wrap" gap="$2">
            {isLoadingVariants ? (
              <ProductSizeSkeletonGrid
                itemBorderRadius={8}
                itemBorderWidth={2}
                itemHeight={44}
                itemMinWidth={64}
              />
            ) : (
              variants.map((variant) => {
                const available = variant.hasStock && variant.quantity > 0;
                const selected = selectedVariant?.id === variant.id;
                return (
                  <XStack
                    accessibilityLabel={`Beden ${variant.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !available, selected }}
                    alignItems="center"
                    backgroundColor={selected && available ? '$brand' : '$background'}
                    borderColor={selected ? '$brand' : '$borderColor'}
                    borderRadius="$3"
                    borderWidth={2}
                    disabled={!available}
                    justifyContent="center"
                    key={variant.id}
                    minWidth={64}
                    onPress={() => available && onSelectVariant(variant)}
                    opacity={available ? 1 : 0.5}
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                    pressStyle={available ? { opacity: 0.85 } : undefined}
                  >
                    <Paragraph
                      color={selected && available ? 'white' : selected ? '$brand' : '$color'}
                      fontSize={14}
                      fontWeight="600"
                      textDecorationLine={available ? 'none' : 'line-through'}
                    >
                      {variant.name}
                      {variant.name2 ? ` (${variant.name2})` : ''}
                    </Paragraph>
                  </XStack>
                );
              })
            )}
          </XStack>

          {onAskQuestion ? (
            <Pressable onPress={onAskQuestion}>
              <Paragraph color="$color10" fontSize={12} textAlign="center">
                Aklına takılan bir şey mi var?{' '}
                <Paragraph color="$brand" fontSize={12} fontWeight="600">
                  Soru sor
                </Paragraph>
              </Paragraph>
            </Pressable>
          ) : null}

          <YStack gap="$2">
            <AppButton
              backgroundColor="$brand"
              borderColor="transparent"
              color="white"
              disabled={!canAdd}
              opacity={canAdd ? 1 : 0.5}
              onPress={onConfirm}
              pressStyle={{ opacity: 0.85 }}
            >
              Sepete Ekle
            </AppButton>
            <AppButton backgroundColor="$backgroundHover" borderColor="$borderColor" borderWidth={1} color="$color" onPress={onClose}>
              Vazgeç
            </AppButton>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
