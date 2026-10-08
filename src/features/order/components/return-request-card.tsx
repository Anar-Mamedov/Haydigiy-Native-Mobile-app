import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image as ImagePlaceholderIcon, Undo2 } from '@/components/ui/icons';
import { OrderDetailItem } from '@/types/order.types';
import { describeReturnGroup, ReturnRequestGroup } from '../utils/return-groups';
import { getReturnStatusDetails, getReturnStatusNameLabel } from '../utils/return-status';
import { formatOrderPrice } from '../utils/order-status';
import { ReturnStatusBar } from './return-status-bar';

const THUMB_SIZE = 70;

function DetailLine({ children }: { children: string }) {
  return (
    <Paragraph color="$color10" fontSize={12} selectable>
      {children}
    </Paragraph>
  );
}

/** Talep kartındaki tek iade satırı: ürün, tarihler, iade tutarı ve depo kontrolü çipi. */
function ReturnedItemRow({
  item,
  onPressProduct,
}: {
  item: OrderDetailItem;
  onPressProduct: (slug: string) => void;
}) {
  const openProduct = () => {
    if (item.slug) onPressProduct(item.slug);
  };

  return (
    <XStack
      backgroundColor="$background"
      borderColor="$orange6"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <Pressable
        accessibilityLabel={item.name || 'Ürün'}
        accessibilityRole="button"
        disabled={!item.slug}
        onPress={openProduct}
      >
        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={THUMB_SIZE}
          justifyContent="center"
          overflow="hidden"
          width={THUMB_SIZE}
        >
          {item.image ? (
            <Image
              contentFit="contain"
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={24} />
          )}
        </YStack>
      </Pressable>

      <YStack flex={1} gap="$1">
        <Paragraph
          color="$color"
          fontSize={14}
          fontWeight="600"
          numberOfLines={2}
          onPress={item.slug ? openProduct : undefined}
        >
          {item.name}
        </Paragraph>
        <Paragraph color="$color10" fontSize={12}>
          Beden: {item.variantName || '-'} - Adet: {item.quantity}
        </Paragraph>
        <Paragraph color="$green10" fontSize={14} fontWeight="800">
          {formatOrderPrice(item.price)}
        </Paragraph>

        <YStack gap="$1" paddingTop="$1">
          {item.returnRequestedAt ? (
            <DetailLine>{`Talep Tarihi: ${item.returnRequestedAt}`}</DetailLine>
          ) : null}
          {item.returnReceivedAt ? (
            <DetailLine>{`Ürün Ulaşma Tarihi: ${item.returnReceivedAt}`}</DetailLine>
          ) : null}
          {item.returnApprovedAt ? (
            <DetailLine>{`Onay Tarihi: ${item.returnApprovedAt}`}</DetailLine>
          ) : null}
          {item.returnRefundAmount ? (
            <Paragraph color="$green10" fontSize={12} fontWeight="700">
              İade Tutarı: {formatOrderPrice(item.returnRefundAmount)}
            </Paragraph>
          ) : null}
          {item.returnPickupDate ? (
            <DetailLine>{`Kargo Teslim Alma Tarihi: ${item.returnPickupDate}`}</DetailLine>
          ) : null}
        </YStack>

        <XStack marginTop="$1">
          <XStack backgroundColor="$orange3" borderRadius={100} paddingHorizontal="$3" paddingVertical="$1">
            <Paragraph color="$brand" fontSize={11} fontWeight="700">
              {getReturnStatusNameLabel(item.returnStatusName)}
            </Paragraph>
          </XStack>
        </XStack>
      </YStack>
    </XStack>
  );
}

type ReturnRequestCardProps = {
  group: ReturnRequestGroup;
  onPressProduct: (slug: string) => void;
  /** Beklemedeki talep için "İade talebini iptal et" (onay sheet'ini açar). */
  onRequestCancel: (returnRequestId: number) => void;
  /** Bu kartın talebi şu an iptal ediliyor mu? */
  isCanceling: boolean;
};

/**
 * Tek iade talebinin kartı — web "new returned card" tasarımı: durum başlığı,
 * ürün sayısı özeti, iade kodu ve (beklemedeyse) iptal butonu; altında ilerleme
 * çubuğu ve talebin ürünleri. Tamamlanan talepler tek kartta birleşir.
 */
export function ReturnRequestCard({
  group,
  onPressProduct,
  onRequestCancel,
  isCanceling,
}: ReturnRequestCardProps) {
  const { title } = getReturnStatusDetails(group.statusCode);
  const cancellableId = group.cancellable ? group.returnRequestId : null;

  return (
    <YStack
      backgroundColor="$background"
      borderColor="$orange6"
      borderRadius="$7"
      borderWidth={1}
      overflow="hidden"
      testID={`return-request-card-${group.key}`}
    >
      <XStack
        alignItems="center"
        backgroundColor="$orange3"
        gap="$2"
        justifyContent="space-between"
        padding="$3"
      >
        <XStack alignItems="center" flex={1} gap="$2">
          <Undo2 color="$brand" size={18} />
          <YStack flex={1} gap="$0.5">
            <Paragraph color="$brand" fontSize={14} fontWeight="700">
              {title}
            </Paragraph>
            <Paragraph color="$brand" fontSize={12}>
              {describeReturnGroup(group)}
            </Paragraph>
            {!group.isCompleted && group.returnCode ? (
              <Paragraph color="$brand" fontSize={12} fontWeight="700" selectable>
                İade kodu: {group.returnCode}
              </Paragraph>
            ) : null}
          </YStack>
        </XStack>
        {cancellableId !== null ? (
          <Button
            accessibilityLabel="İade talebini iptal et"
            backgroundColor="$background"
            borderColor="$red7"
            borderRadius="$3"
            borderWidth={1}
            disabled={isCanceling}
            height={30}
            onPress={() => onRequestCancel(cancellableId)}
            opacity={isCanceling ? 0.6 : 1}
            paddingHorizontal="$2"
            pressStyle={{ backgroundColor: '$red2' }}
          >
            <Paragraph color="$red10" fontSize={11} fontWeight="600">
              {isCanceling ? 'İptal ediliyor...' : 'İade talebini iptal et'}
            </Paragraph>
          </Button>
        ) : null}
      </XStack>

      <YStack gap="$3" padding="$3">
        <ReturnStatusBar status={group.statusCode} />
        <YStack gap="$3">
          {group.items.map((item, index) => (
            <ReturnedItemRow
              item={item}
              key={`${group.key}-${item.id}-${index}`}
              onPressProduct={onPressProduct}
            />
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
}
