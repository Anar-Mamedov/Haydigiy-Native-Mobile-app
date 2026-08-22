import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TriangleAlert } from '@/components/ui/icons';
import { AppScreen, EmptyState, SectionCard } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useOrderCancelController } from '../hooks/use-order-cancel-controller';
import { OrdersHeader } from '../components/orders-header';
import { CancelItemRow } from '../components/cancel-item-row';
import { CancelReasonSheet } from '../components/cancel-reason-sheet';
import { CampaignBreakWarningSheet } from '../components/campaign-break-warning-sheet';
import { formatOrderPrice } from '../utils/order-status';

export function OrderCancelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; item_id?: string; select_all?: string }>();
  const id = params.id ?? '';
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const preselectItemId = params.item_id ? Number(params.item_id) : null;
  const selectAll = params.select_all === '1' || params.select_all === 'true';

  const controller = useOrderCancelController(id, {
    preselectItemId: Number.isFinite(preselectItemId) ? preselectItemId : null,
    selectAll,
    enabled: isAuthenticated,
  });
  const { order, reasons } = controller;

  const [reasonSheetFor, setReasonSheetFor] = useState<string | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/orders');
  };

  const header = <OrdersHeader onBack={handleBack} title="Sipariş İptal" />;

  if (authLoading || controller.isLoading) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (controller.isError || !order) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Siparişlerime Dön"
            description="Sipariş bilgileri yüklenemedi."
            onActionPress={() => router.replace('/orders')}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const activeReasonId = reasonSheetFor ? controller.itemReasons[reasonSheetFor] : undefined;

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }} showsVerticalScrollIndicator={false}>
          <SectionCard padding="$3">
            <YStack gap="$1">
              <Paragraph color="$color" fontSize={14}>
                Sipariş No:{' '}
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {order.orderNo}
                </Paragraph>
              </Paragraph>
              <Paragraph color="$color10" fontSize={13}>
                Sipariş Tarihi: {order.createdAt}
              </Paragraph>
              <Paragraph color="$color10" fontSize={13}>
                Durum:{' '}
                <Paragraph color={(order.statusColor ?? '$color') as never} fontSize={13} fontWeight="600">
                  {order.status}
                </Paragraph>
              </Paragraph>
              <Paragraph color="$color" fontSize={14} marginTop="$1">
                Toplam:{' '}
                <Paragraph color="$brand" fontSize={14} fontWeight="800">
                  {formatOrderPrice(order.totals.total)}
                </Paragraph>
              </Paragraph>
            </YStack>
          </SectionCard>

          {!controller.isCancelable ? (
            <XStack
              backgroundColor="$yellow2"
              borderColor="$yellow6"
              borderRadius="$4"
              borderWidth={1}
              gap="$2"
              padding="$3"
            >
              <TriangleAlert color="$yellow10" size={20} />
              <Paragraph color="$yellow11" flex={1} fontSize={13} lineHeight={18}>
                Siparişiniz şu anki durumu ({order.status}) nedeniyle iptal edilememektedir. İptal
                işlemi sadece kargoya verilmeden önceki belirli aşamalarda yapılabilir.
              </Paragraph>
            </XStack>
          ) : null}

          <SectionCard padding="$3">
            <YStack gap="$3">
              <Paragraph color="$color" fontSize={15} fontWeight="700">
                Ürünler
              </Paragraph>
              {controller.selectedCount > 0 ? (
                <Paragraph color="$color10" fontSize={12}>
                  İptal etmek istediğiniz ürünler için iptal nedenini belirtmelisiniz.
                </Paragraph>
              ) : null}
              {controller.expandedItems.map((entry) => (
                <CancelItemRow
                  bundleComponents={entry.components}
                  disabled={!controller.isCancelable}
                  isBundle={entry.isBundle}
                  item={entry.item}
                  key={entry.expandedId}
                  onPressReason={() => setReasonSheetFor(entry.expandedId)}
                  onToggle={() => controller.toggleSelect(entry.expandedId)}
                  reasonLabel={
                    reasons.find((r) => r.id === controller.itemReasons[entry.expandedId])?.name
                  }
                  selected={controller.selectedIds.includes(entry.expandedId)}
                />
              ))}
            </YStack>
          </SectionCard>

          {order.cancelledItems.length > 0 ? (
            <YStack
              backgroundColor="$red2"
              borderColor="$red6"
              borderRadius="$5"
              borderWidth={1}
              gap="$2"
              padding="$3"
            >
              <Paragraph color="$red11" fontSize={14} fontWeight="700">
                Daha önce iptal edilen ürünler
              </Paragraph>
              {order.cancelledItems.map((item, index) => (
                <YStack key={`${item.id}-${index}`} gap="$0.5">
                  <Paragraph color="$color" fontSize={13} textDecorationLine="line-through">
                    {item.name}
                  </Paragraph>
                  <Paragraph color="$color10" fontSize={12}>
                    Adet: {item.quantity}
                    {item.note ? ` · ${item.note}` : ''}
                  </Paragraph>
                </YStack>
              ))}
            </YStack>
          ) : null}
        </ScrollView>

        <YStack
          backgroundColor="$background"
          borderTopColor="$borderColor"
          borderTopWidth={1}
          gap="$2.5"
          padding="$4"
        >
          <Button
            backgroundColor="$brand"
            borderRadius="$4"
            disabled={!controller.allSelectedHaveReasons || controller.isSubmitting}
            height={48}
            onPress={controller.cancel}
            opacity={!controller.allSelectedHaveReasons || controller.isSubmitting ? 0.5 : 1}
            pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
          >
            <XStack alignItems="center" gap="$2">
              {controller.isSubmitting ? <Spinner color="white" size="small" /> : null}
              <Paragraph color="white" fontSize={14} fontWeight="700">
                {controller.isSubmitting
                  ? 'İşleniyor...'
                  : controller.selectedCount > 0
                    ? `Seçili ${controller.selectedCount} Ürünü İptal Et`
                    : 'İptal Edilecek Ürünleri Seçin'}
              </Paragraph>
            </XStack>
          </Button>
          <Button
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$4"
            borderWidth={1}
            disabled={controller.isSubmitting}
            height={46}
            onPress={handleBack}
            pressStyle={{ backgroundColor: '$backgroundHover' }}
          >
            <Paragraph color="$color" fontWeight="600">
              Vazgeç
            </Paragraph>
          </Button>
        </YStack>
      </YStack>

      <CancelReasonSheet
        onOpenChange={(next) => {
          if (!next) setReasonSheetFor(null);
        }}
        onSelect={(reasonId) => {
          if (reasonSheetFor) controller.setReason(reasonSheetFor, reasonId);
        }}
        open={reasonSheetFor !== null}
        reasons={reasons}
        selectedReasonId={activeReasonId}
      />

      <CampaignBreakWarningSheet
        confirming={controller.isConfirming}
        onCancel={controller.closeWarning}
        onCancelAll={controller.cancelAll}
        onConfirm={controller.confirmWarning}
        open={controller.showWarning}
        preview={controller.warningPreview}
      />
    </AppScreen>
  );
}
