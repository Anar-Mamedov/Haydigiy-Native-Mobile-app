import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { MessageSquare } from '@/components/ui/icons';
import { EmptyState } from '@/components/ui';
import { useMyReviewEntriesQuery } from '../api/review.queries';
import { MyReviewCard } from './my-review-card';
import { MyReviewEntry, MyReviewFilter } from '@/types/account-activity.types';

type MyReviewsListProps = {
  status: MyReviewFilter;
  emptyMessage: string;
  enabled?: boolean;
};

/**
 * Kullanıcının kendi yorumlarının sonsuz kaydırmalı listesi
 * (`GET /review/my-reviews`).
 *
 * `/review/my` değerlendirilecek sipariş kalemlerini döndürür ve yorumun kendi
 * metnini, fotoğrafını, beğenisini taşımaz; bu yüzden "Onay Bekleyenler" ve
 * "Onaylananlar" sekmeleri bu listeyi kullanır.
 *
 * Dikkat: bu ucun `pending` değeri "moderasyon bekliyor" demektir, ekrandaki
 * "Değerlendir" sekmesinin `pending`i ile aynı şey değildir.
 */
export function MyReviewsList({ status, emptyMessage, enabled = true }: MyReviewsListProps) {
  const router = useRouter();
  const query = useMyReviewEntriesQuery(status, enabled);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

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
          description="Yorumlarınız yüklenirken bir hata oluştu."
          onActionPress={() => query.refetch()}
          primary
          title="Bir Hata Oluştu"
        />
      );
    }

    return <EmptyState description={emptyMessage} icon={<MessageSquare color="$brand" size={32} />} title="Yorum Yok" />;
  };

  return (
    <FlashList
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      data={items}
      ItemSeparatorComponent={() => <YStack height={12} />}
      keyExtractor={(item: MyReviewEntry) => String(item.id)}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <YStack alignItems="center" paddingVertical="$4">
            <Spinner color="$brand" size="small" />
          </YStack>
        ) : null
      }
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      onRefresh={() => query.refetch()}
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      renderItem={({ item }: { item: MyReviewEntry }) => (
        <MyReviewCard onProductPress={(slug) => router.push(`/product/${slug}` as never)} review={item} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
