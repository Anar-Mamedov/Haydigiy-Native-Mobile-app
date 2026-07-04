import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { CircleAlert, CircleX, Undo2 } from '@tamagui/lucide-icons-2';
import { AppScreen, EmptyState } from '@/components/ui';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useOrderDetailQuery } from '../api/order.queries';
import { OrdersHeader } from '../components/orders-header';
import { OrderDetailSummary } from '../components/order-detail-summary';
import { OrderTimeline } from '../components/order-timeline';
import { OrderItemsSection } from '../components/order-items-section';
import { OrderAddressCard } from '../components/order-address-card';
import { OrderPaymentCard } from '../components/order-payment-card';
import { OrderReviewSheet } from '../components/order-review-sheet';
import { AgreementTab, OrderAgreementSheet } from '../components/order-agreement-sheet';
import { isOrderCancellableStatus } from '../utils/order-status';
import { getReturnBlockBannerMessage } from '../utils/return-block';
import { OrderDetailItem } from '@/types/order.types';

const REVIEWABLE_STATUSES = ['Teslim Edildi', 'Sipariş tamamlandı'];

export function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? '';
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const query = useOrderDetailQuery(id, isAuthenticated);
  const order = query.data;

  const [reviewItem, setReviewItem] = useState<OrderDetailItem | null>(null);
  const [agreementTab, setAgreementTab] = useState<AgreementTab | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/orders');
    }
  };

  const openProduct = (slug: string) => router.push(`/product/${slug}` as never);
  const goToCancel = (query = '') => router.push(`/(tabs)/order-cancel/${id}${query}` as never);
  const goToReturn = (query = '') => router.push(`/(tabs)/return-create/${id}${query}` as never);

  const isCancelable = order ? isOrderCancellableStatus(order.status, order.statusId) : false;
  const canCreateReturn = !isCancelable && (order?.canCreateReturnRequest ?? false);
  const hasReturnableItems = order?.items.some((item) => !item.isNonReturnable) ?? false;
  const showReturnEntry = canCreateReturn && hasReturnableItems;
  const returnBlockMessage = order ? getReturnBlockBannerMessage(order, isCancelable) : null;

  const header = <OrdersHeader onBack={handleBack} title="Siparişim" />;

  if (authLoading || query.isPending) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError || !order) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Sipariş detayı yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <ScrollView
          contentContainerStyle={{ padding: 12, gap: 12 }}
          refreshControl={
            <RefreshControl
              colors={[BRAND_COLOR]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={BRAND_COLOR}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <OrderDetailSummary order={order} />
          <OrderTimeline statusId={order.statusId} />

          <OrderItemsSection
            items={order.cancelledItems}
            onPressProduct={openProduct}
            title="İptal Edilen Ürünler"
            titleColor="$red10"
          />
          <OrderItemsSection
            cancelable={isCancelable}
            headerAction={
              showReturnEntry ? (
                <XStack
                  accessibilityLabel="İade oluştur"
                  accessibilityRole="button"
                  alignItems="center"
                  backgroundColor="$orange3"
                  borderColor="$brand"
                  borderRadius="$3"
                  borderWidth={1}
                  gap="$2"
                  onPress={() => goToReturn()}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Undo2 color="$brand" size={16} />
                  <YStack>
                    <Paragraph color="$brand" fontSize={13} fontWeight="700" lineHeight={16}>
                      İade oluştur
                    </Paragraph>
                    {order.returnDeadline ? (
                      <Paragraph color="$brand" fontSize={10} lineHeight={13}>
                        Son: {order.returnDeadline}
                      </Paragraph>
                    ) : null}
                  </YStack>
                </XStack>
              ) : undefined
            }
            items={order.items}
            onCancelItem={(item) => goToCancel(`?item_id=${item.id}`)}
            onPressProduct={openProduct}
            onReturnItem={(item) => goToReturn(`?item_id=${item.id}`)}
            onReview={setReviewItem}
            returnable={canCreateReturn}
            reviewable={REVIEWABLE_STATUSES.includes(order.status)}
            title="Ürünler"
          />
          <OrderItemsSection
            items={order.returnedItems}
            onPressProduct={openProduct}
            title="İade Edilen Ürünler"
            titleColor="$brand"
          />

          {isCancelable ? (
            <Button
              accessibilityLabel="Sipariş İptal Et"
              backgroundColor="$background"
              borderColor="$red8"
              borderRadius="$4"
              borderWidth={1}
              height={48}
              onPress={() => goToCancel('?select_all=1')}
              pressStyle={{ backgroundColor: '$red2' }}
            >
              <XStack alignItems="center" gap="$2">
                <CircleX color="$red10" size={18} />
                <Paragraph color="$red10" fontSize={14} fontWeight="700">
                  Sipariş İptal Et
                </Paragraph>
              </XStack>
            </Button>
          ) : null}

          {returnBlockMessage ? (
            <XStack
              alignItems="center"
              backgroundColor="$red2"
              borderColor="$red6"
              borderRadius="$4"
              borderWidth={1}
              gap="$2"
              padding="$3"
            >
              <CircleAlert color="$red10" size={18} />
              <Paragraph color="$red11" flex={1} fontSize={13} fontWeight="600">
                {returnBlockMessage}
              </Paragraph>
            </XStack>
          ) : null}

          <OrderAddressCard order={order} />
          <OrderPaymentCard totals={order.totals} />

          <YStack gap="$3" paddingTop="$1">
            {(['mesafeli', 'onbilgi'] as const).map((tab) => (
              <Button
                accessibilityLabel={tab === 'mesafeli' ? 'Mesafeli Satış Sözleşmesi' : 'Ön Bilgilendirme Formu'}
                backgroundColor="$background"
                borderColor="$brand"
                borderRadius="$4"
                borderWidth={1}
                height={48}
                key={tab}
                onPress={() => setAgreementTab(tab)}
                pressStyle={{ backgroundColor: '$backgroundHover' }}
              >
                <Paragraph color="$brand" fontSize={14} fontWeight="700">
                  {tab === 'mesafeli' ? 'Mesafeli Satış Sözleşmesi' : 'Ön Bilgilendirme Formu'}
                </Paragraph>
              </Button>
            ))}
          </YStack>
        </ScrollView>
      </YStack>

      <OrderAgreementSheet
        initialTab={agreementTab ?? 'mesafeli'}
        onOpenChange={(next) => {
          if (!next) setAgreementTab(null);
        }}
        open={agreementTab !== null}
        order={order}
      />

      <OrderReviewSheet
        item={reviewItem}
        onOpenChange={(next) => {
          if (!next) setReviewItem(null);
        }}
        onSubmitted={() => query.refetch()}
        open={reviewItem !== null}
        orderId={id}
      />
    </AppScreen>
  );
}
