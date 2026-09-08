import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Spinner, YStack } from 'tamagui';
import { MessageCircle } from '@/components/ui/icons';
import { AppScreen, EmptyState, ScreenHeader, TabStrip, type TabStripItem } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useMyQuestionsQuery } from '../api/question.queries';
import { MyQuestionCard } from '../components/my-question-card';
import { MyQuestion, MyQuestionFilter } from '@/types/account-activity.types';

const TABS: TabStripItem[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'answered', label: 'Cevaplananlar' },
  { key: 'pending', label: 'Cevap Bekleyenler' },
];

const EMPTY_COPY: Record<MyQuestionFilter, string> = {
  all: 'Henüz bir ürüne soru sormadınız.',
  answered: 'Cevaplanmış sorunuz bulunmuyor.',
  pending: 'Cevap bekleyen sorunuz bulunmuyor.',
};

/** Kullanıcının kendi sorularının ekranı (`GET /question/my`). */
export function MyQuestionsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const [activeTab, setActiveTab] = useState<MyQuestionFilter>('all');

  const query = useMyQuestionsQuery(activeTab, isAuthenticated);
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Sorularım" />;

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
            description="Sorularınızı görmek için hesabınıza giriş yapın."
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
          description="Sorularınız yüklenirken bir hata oluştu."
          onActionPress={() => query.refetch()}
          primary
          title="Bir Hata Oluştu"
        />
      );
    }

    return <EmptyState description={EMPTY_COPY[activeTab]} icon={<MessageCircle color="$brand" size={32} />} title="Soru Yok" />;
  };

  return (
    <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
      <YStack flex={1}>
        <TabStrip activeKey={activeTab} onChange={(key) => setActiveTab(key as MyQuestionFilter)} tabs={TABS} />
        <YStack flex={1}>
          <FlashList
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            data={items}
            ItemSeparatorComponent={() => <YStack height={12} />}
            keyExtractor={(item: MyQuestion) => String(item.id)}
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
            renderItem={({ item }: { item: MyQuestion }) => (
              <MyQuestionCard onProductPress={(slug) => router.push(`/product/${slug}` as never)} question={item} />
            )}
            showsVerticalScrollIndicator={false}
          />
        </YStack>
      </YStack>
    </AppScreen>
  );
}
