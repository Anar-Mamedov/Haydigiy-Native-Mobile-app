import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import type {
  ReturnConfirmDetail,
  ReturnConfirmItem,
  ReturnConfirmSummary,
} from '../utils/return-confirm-summary';

const THUMB_SIZE = 48;

type Props = {
  open: boolean;
  summary: ReturnConfirmSummary;
  isConfirming: boolean;
  /** Hepsijet randevusu oluşturulurken buton bunu söyler. */
  isSchedulingPickup: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

function ConfirmItemRow({ item }: { item: ReturnConfirmItem }) {
  return (
    <XStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
      testID={`return-confirm-item-${item.key}`}
    >
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
        {item.imageUrl ? (
          <Image contentFit="contain" source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <ImagePlaceholderIcon color="$color9" size={20} />
        )}
      </YStack>
      <YStack flex={1} gap="$1">
        <Paragraph color="$color" fontSize={13} fontWeight="700" numberOfLines={2}>
          {item.name}
        </Paragraph>
        <XStack alignItems="center" flexWrap="wrap" gap="$2">
          <Paragraph color="$color10" fontSize={12}>
            {item.variantName ? `Beden: ${item.variantName} · ` : ''}
            {item.quantity} adet
          </Paragraph>
          {item.isGift ? (
            <YStack
              backgroundColor="$yellow2"
              borderColor="$yellow6"
              borderRadius="$2"
              borderWidth={1}
              paddingHorizontal="$1.5"
            >
              <Paragraph color="$yellow11" fontSize={10} fontWeight="700">
                Hediye
              </Paragraph>
            </YStack>
          ) : null}
        </XStack>
        {item.reasonName ? (
          <Paragraph color="$color10" fontSize={12}>
            İade nedeni:{' '}
            <Paragraph color="$color" fontSize={12} fontWeight="700">
              {item.reasonName}
            </Paragraph>
          </Paragraph>
        ) : null}
      </YStack>
    </XStack>
  );
}

function ConfirmDetails({ details }: { details: ReturnConfirmDetail[] }) {
  return (
    <YStack borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$2" padding="$3">
      {details.map((detail) => (
        <XStack gap="$3" justifyContent="space-between" key={detail.label}>
          <Paragraph color="$color10" fontSize={12}>
            {detail.label}
          </Paragraph>
          <Paragraph color="$color" flexShrink={1} fontSize={12} fontWeight="600" textAlign="right">
            {detail.value}
          </Paragraph>
        </XStack>
      ))}
    </YStack>
  );
}

/** İade talebi gönderilmeden önceki son kontrol: hangi ürün, hangi nedenle, nasıl iade ediliyor. */
export function ReturnConfirmSheet({
  open,
  summary,
  isConfirming,
  isSchedulingPickup,
  onConfirm,
  onOpenChange,
}: Props) {
  const totalQuantity = summary.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ConfirmSheet
      cancelLabel="Vazgeç"
      confirmLabel="Onayla ve İade Et"
      confirmingLabel={isSchedulingPickup ? 'Randevu oluşturuluyor...' : 'Gönderiliyor...'}
      description={`${totalQuantity} ürün için iade talebi oluşturulacak. Lütfen bilgileri kontrol edin.`}
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      testID="return-confirm-sheet"
      title="İade Talebini Onaylayın"
    >
      <YStack gap="$2">
        {summary.items.map((item) => (
          <ConfirmItemRow item={item} key={item.key} />
        ))}
      </YStack>
      {summary.details.length > 0 ? <ConfirmDetails details={summary.details} /> : null}
    </ConfirmSheet>
  );
}
