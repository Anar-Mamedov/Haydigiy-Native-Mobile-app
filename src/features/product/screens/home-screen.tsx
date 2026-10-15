import { useCallback, useMemo, useRef, useState } from 'react';
import { FlashListRef } from '@shopify/flash-list';
import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppHeader, AppScreen, EmptyState } from '@/components/ui';
import { useTabReselect } from '@/components/navigation/tab-reselect';
import { useMobilePageDesignQuery } from '@/features/product/api/page-design.queries';
import { useTrackHomePageView } from '@/features/insider/hooks/use-insider-page-tracking';
import { HomeSectionList } from '@/features/product/components/home-section-list';
import { HomeListItem } from '@/features/product/utils/home-list-items';
import { buildHomeRows } from '@/features/product/utils/home-rows';

export function HomeScreen() {
  useTrackHomePageView();

  const {
    data: designData,
    isPending,
    isError,
    refetch: refetchDesign,
  } = useMobilePageDesignQuery();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ana sayfadayken alt menüdeki "Anasayfa"ya basılırsa ekran yeniden açılmaz, en üste kayar.
  const listRef = useRef<FlashListRef<HomeListItem>>(null);
  const scrollToTop = useCallback(() => listRef.current?.scrollToOffset({ animated: true, offset: 0 }), []);
  useTabReselect('/', scrollToTop);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchDesign();
    setIsRefreshing(false);
  }, [refetchDesign]);

  const handleRetry = () => {
    refetchDesign();
  };

  // Bölümler 12 kolonlu web mobil ızgarasına göre satırlara bölünür.
  const rows = useMemo(() => buildHomeRows(designData?.sections), [designData?.sections]);

  return (
    <AppScreen scrollable={false} header={<AppHeader />} padding={0} gap={0}>

      {isPending ? (
        <YStack alignItems="center" flex={1} justifyContent="center" gap="$3">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10">Yükleniyor...</Paragraph>
        </YStack>
      ) : null}

      {isError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Sayfa yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onActionPress={handleRetry}
          title="Sayfa Yüklenemedi"
        />
      ) : null}

      {!isPending && !isError ? (
        <HomeSectionList
          listRef={listRef}
          onRefresh={() => {
            void handleRefresh();
          }}
          refreshing={isRefreshing}
          rows={rows}
        />
      ) : null}
    </AppScreen>
  );
}
