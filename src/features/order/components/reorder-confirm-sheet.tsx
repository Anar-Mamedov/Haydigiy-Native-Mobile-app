import { ReactNode, useState } from 'react';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import type {
  ReorderAvailableItem,
  ReorderConfirmation,
  ReorderItem,
  ReorderOutOfStockItem,
} from '@/types/order.types';

const THUMB_SIZE = 48;
const IMAGE_STYLE = { height: '100%', width: '100%' } as const;

type Props = {
  open: boolean;
  /** Last "some lines sold out" answer; kept while the sheet animates closed. */
  confirmation: ReorderConfirmation | null;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Product image, or a themed placeholder when there is none or it fails to load. */
function ItemThumb({ imageUrl, testID }: { imageUrl: string | null; testID: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = imageUrl !== null && imageUrl !== failedUrl;

  return (
    <YStack
      alignItems="center"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$3"
      borderWidth={1}
      height={THUMB_SIZE}
      justifyContent="center"
      overflow="hidden"
      width={THUMB_SIZE}
    >
      {showImage ? (
        <Image
          contentFit="contain"
          onError={() => setFailedUrl(imageUrl)}
          source={{ uri: imageUrl }}
          style={IMAGE_STYLE}
          testID={`${testID}-image`}
        />
      ) : (
        <YStack testID={`${testID}-placeholder`}>
          <ImagePlaceholderIcon color="$color9" size={20} />
        </YStack>
      )}
    </YStack>
  );
}

function ItemRow({
  item,
  testID,
  children,
}: {
  item: ReorderItem;
  testID: string;
  children: ReactNode;
}) {
  return (
    <XStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
      testID={testID}
    >
      <ItemThumb imageUrl={item.imageUrl} testID={testID} />
      <YStack flex={1} gap="$1">
        <Paragraph color="$color" fontSize={13} fontWeight="700" numberOfLines={2}>
          {item.name}
        </Paragraph>
        {children}
      </YStack>
    </XStack>
  );
}

function sizeLabel(item: ReorderItem): string {
  return item.variantName ? `Beden: ${item.variantName}` : '';
}

function OutOfStockRow({ item }: { item: ReorderOutOfStockItem }) {
  const size = sizeLabel(item);
  return (
    <ItemRow item={item} testID={`reorder-out-of-stock-item-${item.key}`}>
      {size ? (
        <Paragraph color="$color10" fontSize={12}>
          {size}
        </Paragraph>
      ) : null}
      <Paragraph color="$red10" fontSize={12} fontWeight="600">
        {item.reason}
      </Paragraph>
    </ItemRow>
  );
}

function AvailableRow({ item }: { item: ReorderAvailableItem }) {
  const details = [sizeLabel(item), `${item.addQuantity} adet`].filter(Boolean).join(' · ');
  return (
    <ItemRow item={item} testID={`reorder-available-item-${item.key}`}>
      <Paragraph color="$color10" fontSize={12}>
        {details}
      </Paragraph>
      {item.isPartialStock ? (
        <Paragraph color="$orange10" fontSize={12} fontWeight="600">
          {`Stokta ${item.addQuantity} adet var`}
        </Paragraph>
      ) : null}
    </ItemRow>
  );
}

function ItemSection({
  title,
  titleColor,
  testID,
  children,
}: {
  title: string;
  titleColor: '$red10' | '$color';
  testID: string;
  children: ReactNode;
}) {
  return (
    <YStack gap="$2" testID={testID}>
      <Paragraph accessibilityRole="header" color={titleColor} fontSize={14} fontWeight="700">
        {title}
      </Paragraph>
      {children}
    </YStack>
  );
}

/**
 * Asked when some lines of the order sold out: lists what cannot be added and
 * what will go into the cart. Presentational; the request lifecycle lives in
 * `useReorderController`. The shared `ConfirmSheet` keeps the header and actions
 * pinned while long lists scroll, and blocks dismissal while confirming.
 */
export function ReorderConfirmSheet({
  open,
  confirmation,
  isConfirming,
  onConfirm,
  onCancel,
}: Props) {
  const outOfStockItems = confirmation?.outOfStockItems ?? [];
  const availableItems = confirmation?.availableItems ?? [];

  return (
    <ConfirmSheet
      cancelLabel="Vazgeç"
      confirmLabel="Evet, mevcut olanları ekle"
      confirmingLabel="Ekleniyor..."
      description={confirmation?.message}
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
      open={open}
      testID="reorder-confirm-sheet"
      title="Siparişi Tekrarla"
    >
      {outOfStockItems.length > 0 ? (
        <ItemSection
          title="Tükenen ürünler"
          titleColor="$red10"
          testID="reorder-out-of-stock-section"
        >
          {outOfStockItems.map((item) => (
            <OutOfStockRow item={item} key={item.key} />
          ))}
        </ItemSection>
      ) : null}
      {availableItems.length > 0 ? (
        <ItemSection
          title="Sepete eklenecek ürünler"
          titleColor="$color"
          testID="reorder-available-section"
        >
          {availableItems.map((item) => (
            <AvailableRow item={item} key={item.key} />
          ))}
        </ItemSection>
      ) : null}
    </ConfirmSheet>
  );
}
