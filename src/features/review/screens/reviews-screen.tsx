import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { MessageSquare } from '@tamagui/lucide-icons-2';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
// Reuses the order feature's review submission sheet (shared review UI) to avoid
// duplicating the rating/comment/photo form across features.
import { OrderReviewSheet } from '@/features/order/components/order-review-sheet';
import { useMyReviewsQuery } from '../api/review.queries';
import { ReviewTabs } from '../components/review-tabs';
import { ReviewProductRow } from '../components/review-product-row';
import { ReviewTab, ReviewTabKey, ReviewTarget, UserReview } from '@/types/review.types';

const DEFAULT_TABS: ReviewTab[] = [
  { key: 'pending', label: 'Değerlendir' },
  { key: 'waiting', label: 'Onay Bekleyenler' },
  { key: 'approved', label: 'Onaylananlar' },
];

const EMPTY_COPY: Record<ReviewTabKey, string> = {
  pending: 'Değerlendirebileceğiniz bir ürün bulunmuyor.',
  waiting: 'Onay bekleyen değerlendirmeniz bulunmuyor.',
  approved: 'Onaylanmış değerlendirmeniz bulunmuyor.',
};

function toReviewTarget(review: UserReview): ReviewTarget {
  return {
    id: review.orderItemId,
    productId: review.productId,
    variantId: review.variantId,
    name: review.productName,
    variantName: review.variantName,
    slug: review.slug,
    image: review.productImage,
    quantity: 1,
  };
}

export function ReviewsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const [activeTab, setActiveTab] = useState<ReviewTabKey>('pending');
  const [selectedReview, setSelectedReview] = useState<UserReview | null>(null);

  const query = useMyReviewsQuery(activeTab, isAuthenticated);
  const items = query.data?.items ?? [];
  const tabs = query.data?.tabs?.length ? query.data.tabs : DEFAULT_TABS;

  const reviewTarget = useMemo(
    () => (selectedReview ? toReviewTarget(selectedReview) : null),
    [selectedReview],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Ürün Değerlendirmelerim" />;

  if (authLoading) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Giriş Yap"
            description="Değerlendirmelerinizi görmek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  const renderEmpty = () => {
    if (query.isPending) {
      return (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8">
          <Spinner color="$brand" size="large" />
        </YStack>
      );
    }
    if (query.isError) {
      return (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Değerlendirmeler yüklenirken bir hata oluştu."
          onActionPress={() => query.refetch()}
          primary
          title="Bir Hata Oluştu"
        />
      );
    }
    return (
      <EmptyState
        description={EMPTY_COPY[activeTab]}
        icon={<MessageSquare color="$brand" size={32} />}
        title="Değerlendirme Yok"
      />
    );
  };

  return (
    <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
      <YStack flex={1}>
        <ReviewTabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ReviewTabKey)}
          tabs={tabs}
        />
        <YStack flex={1}>
          <FlashList
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            data={items}
            ItemSeparatorComponent={() => <YStack height={12} />}
            keyExtractor={(item: UserReview) => item.id}
            ListEmptyComponent={renderEmpty}
            onRefresh={() => query.refetch()}
            refreshing={query.isRefetching}
            renderItem={({ item }: { item: UserReview }) => (
              <ReviewProductRow
                activeTab={activeTab}
                onProductPress={(slug) => router.push(`/product/${slug}` as never)}
                onReviewPress={setSelectedReview}
                review={item}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </YStack>
      </YStack>

      <OrderReviewSheet
        item={reviewTarget}
        onOpenChange={(next) => {
          if (!next) setSelectedReview(null);
        }}
        onSubmitted={() => query.refetch()}
        open={selectedReview !== null}
        orderId={selectedReview ? String(selectedReview.orderId) : ''}
      />
    </AppScreen>
  );
}
