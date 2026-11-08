import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { AppButton, AppSelect, AppSelectOption } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Gift } from '@/components/ui/icons';
import { useAvailableGiftSelection } from '@/features/cart/hooks/use-available-gift-selection';
import { AvailableGift } from '@/types/cart.types';

const IMAGE_WIDTH = 72;
const IMAGE_HEIGHT = 96;

/** Stoğu yetmeyen beden listede kalır ama seçilemez; nedeni etikette yazar. */
function toSizeOptions(gift: AvailableGift): AppSelectOption[] {
  return gift.sizes.map((size) => ({
    label: size.canAdd ? size.name : `${size.name} (Stok yetersiz)`,
    value: size.variantId,
    disabled: !size.canAdd,
  }));
}

type AvailableGiftRowProps = {
  gift: AvailableGift;
  selectedVariantId?: string;
  canAdd: boolean;
  isAdding: boolean;
  /** Herhangi bir hediye eklenirken diğer seçimler de kilitlenir. */
  locked: boolean;
  onSelectSize: (variantId: string) => void;
  onAdd: () => void;
};

function AvailableGiftRow({
  gift,
  selectedVariantId,
  canAdd,
  isAdding,
  locked,
  onSelectSize,
  onAdd,
}: AvailableGiftRowProps) {
  return (
    <XStack backgroundColor="$background" borderRadius="$4" gap="$3" padding="$3">
      <YStack
        backgroundColor="$backgroundHover"
        borderRadius="$3"
        height={IMAGE_HEIGHT}
        overflow="hidden"
        width={IMAGE_WIDTH}
      >
        {gift.imageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            contentFit="cover"
            source={{ uri: gift.imageUrl }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : null}
      </YStack>

      <YStack flex={1} gap="$2" minWidth={0}>
        <YStack gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
            {gift.name}
          </Paragraph>
          <Paragraph color="$brandTintText" fontSize={12} fontWeight="700">
            {`${gift.quantity} adet HEDİYE`}
          </Paragraph>
        </YStack>

        <AppSelect
          disabled={locked}
          label={`${gift.name} bedeni`}
          onValueChange={(value) => onSelectSize(String(value))}
          options={toSizeOptions(gift)}
          placeholder="Beden seçin"
          value={selectedVariantId ?? null}
        />

        <AppButton
          accessibilityLabel={`${gift.name} hediyesini sepete ekle`}
          accessibilityState={{ disabled: !canAdd, busy: isAdding }}
          backgroundColor="$brand"
          borderColor="$brand"
          color="white"
          disabled={!canAdd}
          onPress={canAdd ? onAdd : undefined}
          opacity={canAdd || isAdding ? 1 : 0.5}
          pressStyle={{ backgroundColor: '$brand', borderColor: '$brand', opacity: 0.85 }}
          testID={`available-gift-add-${gift.productId}`}
        >
          {isAdding ? 'Ekleniyor…' : 'Hediyeyi ekle'}
        </AppButton>
      </YStack>
    </XStack>
  );
}

export type AvailableGiftsCardViewProps = {
  gifts: AvailableGift[];
  selectedVariantIds: Record<string, string>;
  addingProductId?: string;
  isAdding: boolean;
  canAdd: (gift: AvailableGift) => boolean;
  onSelectSize: (productId: string, variantId: string) => void;
  onAdd: (gift: AvailableGift) => void;
};

/**
 * "Hediyenizi seçin" kartının sunum katmanı. Hangi hediyelerin sunulacağına
 * backend karar verir (`available_gifts`); kart seçim ve ekleme durumunu
 * prop olarak alır, böylece veri katmanı olmadan test edilebilir.
 */
export function AvailableGiftsCardView({
  gifts,
  selectedVariantIds,
  addingProductId,
  isAdding,
  canAdd,
  onSelectSize,
  onAdd,
}: AvailableGiftsCardViewProps) {
  if (gifts.length === 0) return null;

  return (
    <YStack
      accessibilityLabel="Seçebileceğiniz hediyeler"
      backgroundColor="$brandTint"
      borderColor="$brandTintBorder"
      borderRadius="$5"
      borderWidth={1}
      gap="$3"
      padding="$3"
      testID="available-gifts-card"
    >
      <YStack gap="$1">
        <XStack alignItems="center" gap="$1.5">
          <Gift color="$brandTintText" size={18} />
          <Paragraph accessibilityRole="header" color="$color" fontSize={16} fontWeight="700">
            Hediyenizi seçin
          </Paragraph>
        </XStack>
        <Paragraph color="$color10" fontSize={13} lineHeight={18}>
          Bedeninizi seçip hediyenizi ücretsiz olarak sepetinize ekleyebilirsiniz.
        </Paragraph>
        <Paragraph color="$red10" fontSize={13} fontWeight="700" lineHeight={18}>
          Hediyedir, seçmek zorunda değilsiniz
        </Paragraph>
      </YStack>

      {gifts.map((gift) => (
        <AvailableGiftRow
          canAdd={canAdd(gift)}
          gift={gift}
          isAdding={addingProductId === gift.productId}
          key={gift.productId}
          locked={isAdding}
          onAdd={() => onAdd(gift)}
          onSelectSize={(variantId) => onSelectSize(gift.productId, variantId)}
          selectedVariantId={selectedVariantIds[gift.productId]}
        />
      ))}
    </YStack>
  );
}

/**
 * Sepet ekranındaki "Hediyenizi seçin" kartı — web `AvailableGifts` karşılığı.
 * Seçim ve ekleme isteği `useAvailableGiftSelection`'da; hediye yoksa hiçbir
 * şey render edilmez.
 */
export function AvailableGiftsCard({ gifts }: { gifts: AvailableGift[] }) {
  const selection = useAvailableGiftSelection();

  return (
    <AvailableGiftsCardView
      addingProductId={selection.addingProductId}
      canAdd={selection.canAdd}
      gifts={gifts}
      isAdding={selection.isAdding}
      onAdd={selection.add}
      onSelectSize={selection.selectSize}
      selectedVariantIds={selection.selectedVariantIds}
    />
  );
}
