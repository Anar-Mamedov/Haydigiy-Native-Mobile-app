import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Paragraph, ScrollView, Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState } from '@/components/ui';
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
            items={order.items}
            onPressProduct={openProduct}
            onReview={setReviewItem}
            reviewable={REVIEWABLE_STATUSES.includes(order.status)}
            title="Ürünler"
          />
          <OrderItemsSection
            items={order.returnedItems}
            onPressProduct={openProduct}
            title="İade Edilen Ürünler"
            titleColor="$brand"
          />

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
