import { useMemo, useState } from 'react';
import { AlertDialog, Button, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppAlertDialog } from '@/components/ui';
import { useCancelReturnRequest } from '../hooks/use-cancel-return-request';
import { buildReturnRequestGroups } from '../utils/return-groups';
import { OrderDetail } from '@/types/order.types';
import { ReturnRequestCard } from './return-request-card';

type OrderReturnSectionProps = {
  order: OrderDetail;
  onPressProduct: (slug: string) => void;
};

/**
 * Sipariş detayındaki iade kartları — web sipariş detayının 1:1 portu: her iade
 * talebi kendi kartında (durum başlığı, iade kodu, ilerleme çubuğu, ürünler),
 * ödemesi tamamlananlar tek kartta. Beklemedeki talep için "İade talebini iptal
 * et" akışı (onay + Hepsijet gönderi iptali + talep silme) talep bazında çalışır.
 */
export function OrderReturnSection({ order, onPressProduct }: OrderReturnSectionProps) {
  const cancel = useCancelReturnRequest(order);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const groups = useMemo(() => buildReturnRequestGroups(order.returnedItems), [order.returnedItems]);

  if (groups.length === 0) return null;

  const handleConfirmCancel = () => {
    const returnRequestId = confirmId;
    setConfirmId(null);
    if (returnRequestId !== null) cancel.cancelReturn(returnRequestId);
  };

  return (
    <YStack gap="$3">
      {groups.map((group) => (
        <ReturnRequestCard
          group={group}
          isCanceling={group.returnRequestId !== null && cancel.cancelingId === group.returnRequestId}
          key={group.key}
          onPressProduct={onPressProduct}
          onRequestCancel={(returnRequestId) => {
            if (!cancel.isCanceling) setConfirmId(returnRequestId);
          }}
        />
      ))}

      <AppAlertDialog
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        open={confirmId !== null}
      >
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
