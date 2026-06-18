import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { CircleAlert } from '@tamagui/lucide-icons-2';
import { AppInput, AppScreen, EmptyState, SectionCard } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { OrdersHeader } from '../components/orders-header';
import { ReturnItemRow } from '../components/return-item-row';
import { ReturnIbanSection } from '../components/return-iban-section';
import { ReturnMethodSelector } from '../components/return-method-selector';
import { ReturnResultSheets } from '../components/return-result-sheets';
import { NewIbanModal } from '../components/new-iban-modal';
import { useReturnCreateController } from '../hooks/use-return-create-controller';

const BLOCK_MESSAGES: Record<string, string> = {
  time_expired: 'İade süresi (14 gün) doldu.',
  not_delivered: 'Sipariş henüz teslim edilmedi.',
  already_requested: 'Bu sipariş için iade talebi zaten oluşturuldu.',
};

export function ReturnCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; item_id?: string; select_all?: string }>();
  const id = params.id ?? '';
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const preselectItemId = params.item_id ? Number(params.item_id) : null;
  const selectAll = params.select_all === '1' || params.select_all === 'true';

  const [newIbanOpen, setNewIbanOpen] = useState(false);

  const ctrl = useReturnCreateController(id, {
    preselectItemId: Number.isFinite(preselectItemId) ? preselectItemId : null,
    selectAll,
    enabled: isAuthenticated,
  });

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/orders');
  };

  const header = <OrdersHeader onBack={handleBack} title="İade Oluştur" />;

  if (authLoading || ctrl.isLoading) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (ctrl.isError || !ctrl.order) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Sipariş yüklenirken bir hata oluştu."
            onActionPress={() => ctrl.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const order = ctrl.order;
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  if (!ctrl.canCreateReturn) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} padding="$4">
          <YStack
            alignItems="center"
            backgroundColor="$red2"
            borderColor="$red6"
            borderRadius="$4"
            borderWidth={1}
            gap="$2"
            padding="$4"
          >
            <CircleAlert color="$red10" size={28} />
            <Paragraph color="$red11" fontSize={14} fontWeight="600" textAlign="center">
              {BLOCK_MESSAGES[ctrl.returnBlockReason ?? ''] ?? 'İade talebi oluşturulamıyor.'}
            </Paragraph>
          </YStack>
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }} showsVerticalScrollIndicator={false}>
          <SectionCard padding="$3">
            <XStack justifyContent="space-between">
              <YStack>
                <Paragraph color="$color10" fontSize={12}>
                  Sipariş No
                </Paragraph>
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {order.orderNo}
                </Paragraph>
              </YStack>
              <YStack alignItems="flex-end">
                <Paragraph color="$color10" fontSize={12}>
                  Teslim
                </Paragraph>
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {order.deliveredAt || '-'}
                </Paragraph>
              </YStack>
            </XStack>
            <Paragraph color="$color10" fontSize={12} paddingTop="$2">
              {order.items.length} ürün, toplam {totalUnits} adet
            </Paragraph>
          </SectionCard>

          {ctrl.giftItems.length > 0 ? (
            <YStack backgroundColor="$yellow2" borderColor="$yellow6" borderRadius="$4" borderWidth={1} padding="$3">
              <Paragraph color="$yellow11" fontSize={12}>
                Hediye ürünler iade talebine otomatik eklenir.
              </Paragraph>
            </YStack>
          ) : null}

          {ctrl.returnableItems.length === 0 ? (
            <SectionCard padding="$3">
              <Paragraph color="$color10" fontSize={13} textAlign="center">
                Bu sipariş için iade yapılabilecek ürün bulunamadı.
              </Paragraph>
            </SectionCard>
          ) : (
            <YStack gap="$3">
              {ctrl.returnableItems.map((entry) => (
                <ReturnItemRow
                  entry={entry}
                  key={entry.expandedId}
                  onPhotoChange={(photo) => ctrl.setItemPhoto(entry.expandedId, photo)}
                  onReasonChange={(reasonId) => ctrl.setItemReason(entry.expandedId, reasonId)}
                  onToggle={() => ctrl.toggleItem(entry.expandedId)}
                  photo={ctrl.itemPhotos[entry.expandedId]}
                  reasonId={ctrl.itemReasons[entry.expandedId]}
                  reasons={ctrl.reasons}
                  reasonsError={ctrl.reasonsError}
                  reasonsLoading={ctrl.reasonsLoading}
                  selected={ctrl.selectedItems.includes(entry.expandedId)}
                />
              ))}
            </YStack>
          )}

          {ctrl.shouldShowIbanSelect ? (
            <ReturnIbanSection
              iban={ctrl.iban}
              onAddNew={() => setNewIbanOpen(true)}
              paymentError={ctrl.paymentError}
              paymentLoading={ctrl.paymentLoading}
              paymentMethods={ctrl.paymentMethods}
            />
          ) : null}

          {!ctrl.isStorePickup ? (
            <ReturnMethodSelector
              onChange={ctrl.setReturnMethod}
              returnMethod={ctrl.returnMethod}
              scheduled={ctrl.scheduled}
            />
          ) : null}

          <SectionCard padding="$3">
            <AppInput
              label="Not (opsiyonel)"
              multiline
              numberOfLines={3}
              onChangeText={ctrl.setNote}
              placeholder="İade nedeni hakkında ek bilgi"
              value={ctrl.note}
            />
          </SectionCard>

          {ctrl.reasonsError ? (
            <Paragraph color="$red10" fontSize={12}>
              {ctrl.reasonsError}
            </Paragraph>
          ) : null}

          <Button
            accessibilityLabel="İade Talebi Oluştur"
            backgroundColor={ctrl.canSubmit ? '$brand' : '$color5'}
            borderRadius="$4"
            disabled={!ctrl.canSubmit}
            height={48}
            onPress={ctrl.handleSubmit}
            pressStyle={{ opacity: 0.85 }}
          >
            <XStack alignItems="center" gap="$2">
              {ctrl.isSubmitting || ctrl.scheduled.pickupSubmitting ? (
                <Spinner color="white" size="small" />
              ) : null}
              <Paragraph color="white" fontSize={15} fontWeight="700">
                {ctrl.scheduled.pickupSubmitting
                  ? 'Randevu oluşturuluyor...'
                  : ctrl.isSubmitting
                    ? 'Gönderiliyor...'
                    : 'İade Talebi Oluştur'}
              </Paragraph>
            </XStack>
          </Button>
        </ScrollView>
      </YStack>

      <NewIbanModal
        onClose={() => setNewIbanOpen(false)}
        onSuccess={() => setNewIbanOpen(false)}
        open={newIbanOpen}
      />

      <ReturnResultSheets
        errorMessage={ctrl.errorMessage}
        isRecreating={ctrl.isRecreating}
        isStorePickup={ctrl.isStorePickup}
        onCloseError={ctrl.clearError}
        onCloseSuccess={ctrl.closeSuccess}
        onRecreatePtt={ctrl.handleRecreatePtt}
        returnMethod={ctrl.returnMethod}
        successMessage={ctrl.successMessage}
      />
    </AppScreen>
  );
}
