import { useState } from 'react';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { AlertDialog, Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Check, Image as ImagePlaceholderIcon, Undo2 } from '@/components/ui/icons';
import { AppAlertDialog } from '@/components/ui';
import { useCancelReturnRequest } from '../hooks/use-cancel-return-request';
import {
  getReturnProgress,
  getReturnStatusNameLabel,
  isShippedOrLater,
} from '../utils/return-status';
import { formatOrderPrice } from '../utils/order-status';
import { OrderDetail, OrderDetailItem } from '@/types/order.types';

const THUMB_SIZE = 70;

/** İade ilerleme çubuğu (İade Beklemede → … → Ödeme İadesi Yapıldı), web paritesi. */
function ReturnStatusBar({ status }: { status: number | null | undefined }) {
  const progress = getReturnProgress(status);
  if (!progress) return null;

  const activeColor = progress.isError ? '$red10' : '$brand';

  return (
    <XStack paddingHorizontal="$1" paddingVertical="$2">
      {progress.steps.map((label, index) => {
        const isCompleted = progress.completed[index];
        const isCurrent = index === progress.currentIndex;
        const reached = isCompleted || isCurrent;
        const lastIndex = progress.steps.length - 1;

        return (
          <YStack alignItems="center" flex={1} gap="$1.5" key={label}>
            <XStack alignItems="center" width="100%">
              <YStack
                backgroundColor={index === 0 ? 'transparent' : isCompleted ? activeColor : '$borderColor'}
                flex={1}
                height={2}
              />
              <XStack
                alignItems="center"
                backgroundColor={isCompleted ? activeColor : '$background'}
                borderColor={reached ? activeColor : '$borderColor'}
                borderRadius={100}
                borderWidth={1}
                height={18}
                justifyContent="center"
                width={18}
              >
                {isCompleted ? (
                  <Check color="white" size={11} />
                ) : (
                  <YStack
                    backgroundColor={reached ? activeColor : '$color8'}
                    borderRadius={100}
                    height={6}
                    width={6}
                  />
                )}
              </XStack>
              <YStack
                backgroundColor={
                  index === lastIndex ? 'transparent' : index < progress.currentIndex ? activeColor : '$borderColor'
                }
                flex={1}
                height={2}
              />
            </XStack>
            <Paragraph
              color={reached ? '$color' : '$color9'}
              fontSize={9}
              fontWeight={reached ? '700' : '500'}
              lineHeight={11}
              numberOfLines={3}
              textAlign="center"
            >
              {label}
            </Paragraph>
          </YStack>
        );
      })}
    </XStack>
  );
}

function ReturnedItemCard({
  item,
  onPressProduct,
}: {
  item: OrderDetailItem;
  onPressProduct: (slug: string) => void;
}) {
  const statusLabel = getReturnStatusNameLabel(item.returnStatusName);
  const notCancelable =
    (isShippedOrLater(item.returnStatusCode) || Boolean(item.returnReceivedAt)) &&
    item.returnStatusCode !== 6;

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
        onPress={() => item.slug && onPressProduct(item.slug)}
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
          onPress={() => item.slug && onPressProduct(item.slug)}
        >
          {item.name}
        </Paragraph>
        <Paragraph color="$color10" fontSize={12}>
          Beden: {item.variantName || '-'} - Adet: {item.quantity}
        </Paragraph>
        <Paragraph color="$green10" fontSize={14} fontWeight="800">
          {formatOrderPrice(item.price)}
        </Paragraph>
        {item.returnCode ? (
          <Paragraph color="$color10" fontSize={12}>
            İade Kodu:{' '}
            <Paragraph color="$brand" fontSize={12} fontWeight="700">
              {item.returnCode}
            </Paragraph>
          </Paragraph>
        ) : null}
        {item.returnRequestedAt ? (
          <Paragraph color="$color10" fontSize={12}>
            İade Tarihi: {item.returnRequestedAt}
          </Paragraph>
        ) : null}
        {item.returnPickupDate ? (
          <Paragraph color="$color10" fontSize={12} selectable>
            Kargo Teslim Alma Tarihi: {item.returnPickupDate}
          </Paragraph>
        ) : null}
        <XStack marginTop="$1">
          <XStack backgroundColor="$orange3" borderRadius={100} paddingHorizontal="$3" paddingVertical="$1">
            <Paragraph color="$brand" fontSize={11} fontWeight="700">
              {statusLabel}
            </Paragraph>
          </XStack>
        </XStack>
        {notCancelable ? (
          <Paragraph color="$color9" fontSize={11}>
            Kargoya teslim edildiği için iptal edilemez.
          </Paragraph>
        ) : null}
      </YStack>
    </XStack>
  );
}

type OrderReturnSectionProps = {
  order: OrderDetail;
  onPressProduct: (slug: string) => void;
};

/**
 * "İade Edildi" bölümü — web sipariş detayının 1:1 portu: iade ilerleme çubuğu,
 * iade kodu/tarihi/durum çipli ürün kartları ve beklemedeki talep için
 * "İade talebini iptal et" akışı (onay + Hepsijet gönderi iptali + talep silme).
 */
export function OrderReturnSection({ order, onPressProduct }: OrderReturnSectionProps) {
  const cancel = useCancelReturnRequest(order);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (order.returnedItems.length === 0) return null;

  const cancellableId = order.cancellableReturnRequestId;

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    if (cancellableId) cancel.cancelReturn(cancellableId);
  };

  return (
    <YStack
      backgroundColor="$orange2"
      borderColor="$orange6"
      borderRadius="$7"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
        <XStack alignItems="center" flex={1} gap="$2">
          <Undo2 color="$brand" size={18} />
          <YStack flex={1}>
            <Paragraph color="$brand" fontSize={15} fontWeight="700">
              İade Edildi
            </Paragraph>
            <Paragraph color="$brand" fontSize={11}>
              Aşağıda gösterilen {order.returnedItems.length} ürün için iade talebi oluşturuldu.
            </Paragraph>
          </YStack>
        </XStack>
        {cancellableId ? (
          <Button
            accessibilityLabel="İade talebini iptal et"
            backgroundColor="$background"
            borderColor="$red7"
            borderRadius="$3"
            borderWidth={1}
            disabled={cancel.isCanceling}
            height={32}
            onPress={() => setConfirmOpen(true)}
            opacity={cancel.isCanceling ? 0.6 : 1}
            paddingHorizontal="$2.5"
            pressStyle={{ backgroundColor: '$red2' }}
          >
            <Paragraph color="$red10" fontSize={11} fontWeight="600">
              {cancel.isCanceling ? 'İptal ediliyor...' : 'İade talebini iptal et'}
            </Paragraph>
          </Button>
        ) : null}
      </XStack>

      <ReturnStatusBar status={order.returnedItems[0]?.returnStatusCode} />

      <YStack gap="$3">
        {order.returnedItems.map((item, index) => (
          <ReturnedItemCard item={item} key={`${item.id}-${index}`} onPressProduct={onPressProduct} />
        ))}
      </YStack>

      <AppAlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <YStack gap="$3">
          <AlertDialog.Title asChild>
            <Paragraph color="$color" fontSize={16} fontWeight="700">
              İade talebini iptal et
            </Paragraph>
          </AlertDialog.Title>
          <AlertDialog.Description asChild>
            <Paragraph color="$color10" fontSize={14} lineHeight={20}>
              İade talebini iptal etmek istediğinize emin misiniz?
            </Paragraph>
          </AlertDialog.Description>
          <YStack gap="$3" marginTop="$2">
            <Button
              accessibilityRole="button"
              backgroundColor="$red10"
              borderRadius="$4"
              height={46}
              onPress={handleConfirmCancel}
              pressStyle={{ backgroundColor: '$red10', opacity: 0.85 }}
            >
              <Paragraph color="white" fontWeight="700">
                Evet, iptal et
              </Paragraph>
            </Button>
            <AlertDialog.Cancel asChild>
              <Button accessibilityRole="button" chromeless height={40}>
                <Paragraph color="$color10" fontWeight="600">
                  Vazgeç
                </Paragraph>
              </Button>
            </AlertDialog.Cancel>
          </YStack>
        </YStack>
      </AppAlertDialog>

      <AppAlertDialog
        onOpenChange={(open) => {
          if (!open) {
            cancel.clearSuccess();
            cancel.clearError();
          }
        }}
        open={cancel.successMessage !== null || cancel.errorMessage !== null}
      >
        <YStack gap="$3">
          <AlertDialog.Title asChild>
            <Paragraph
              color={cancel.errorMessage ? '$red10' : '$green10'}
              fontSize={16}
              fontWeight="700"
            >
              {cancel.errorMessage ? 'İşlem başarısız' : 'Başarılı'}
            </Paragraph>
          </AlertDialog.Title>
          <AlertDialog.Description asChild>
            <Paragraph color="$color" fontSize={14} lineHeight={20}>
              {cancel.errorMessage ?? cancel.successMessage ?? ''}
            </Paragraph>
          </AlertDialog.Description>
          <AlertDialog.Cancel asChild>
            <Button
              accessibilityRole="button"
              backgroundColor="$brand"
              borderRadius="$4"
              height={44}
              pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
            >
              <Paragraph color="white" fontWeight="700">
                Tamam
              </Paragraph>
            </Button>
          </AlertDialog.Cancel>
        </YStack>
      </AppAlertDialog>
    </YStack>
  );
}
