import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, Pagination } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useOrdersQuery } from '../api/order.queries';
import { OrdersHeader } from '../components/orders-header';
import { OrdersToolbar } from '../components/orders-toolbar';
import { OrderFilterChips } from '../components/order-filter-chips';
import { OrderCard } from '../components/order-card';
import { Order, OrderCategory, OrderDateFilter, OrderFilters } from '@/types/order.types';

const HIDDEN_STATUS = 'Ödeme Kaydı Alınamadı';

export function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const listRef = useRef<FlashListRef<Order>>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<OrderCategory>('all');
  const [dateFilter, setDateFilter] = useState<OrderDateFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 450);
    return () => clearTimeout(handle);
  }, [search]);

  // Any filter change resets to the first page and scrolls back to the top so a
  // shorter result set isn't left scrolled past its content (blank-space bug).
  useEffect(() => {
    setCurrentPage(1);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [debouncedSearch, category, dateFilter]);

  const filters: OrderFilters = { search: debouncedSearch, category, dateFilter };
  const query = useOrdersQuery(filters, currentPage, isAuthenticated);

  const orders = useMemo(
    () => (query.data?.orders ?? []).filter((order) => order.status?.trim() !== HIDDEN_STATUS),
    [query.data],
  );
  const pageCount = query.data?.meta.lastPage ?? 1;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const header = <OrdersHeader onBack={handleBack} title="Tüm Siparişlerim" />;

  if (authLoading) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Giriş Yap"
            description="Siparişlerinizi görmek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/(tabs)/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  const listHeader = (
    <YStack gap="$3" paddingBottom="$2">
      <OrdersToolbar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onSearchChange={setSearch}
        search={search}
      />
      <OrderFilterChips active={category} onChange={setCategory} />
    </YStack>
  );

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
          description="Siparişleriniz yüklenirken bir hata oluştu."
          onActionPress={() => query.refetch()}
          primary
          title="Bir Hata Oluştu"
        />
      );
    }
    return (
      <EmptyState
        actionLabel={category === 'all' ? 'Alışverişe Başla' : undefined}
        description={
          category === 'all'
            ? 'Alışverişe başlayın ve siparişlerinizi burada görün.'
            : 'Bu kategoride sipariş bulunmuyor. Farklı bir kategori seçebilirsiniz.'
        }
        onActionPress={category === 'all' ? () => router.replace('/(tabs)') : undefined}
        primary
        title={category === 'all' ? 'Henüz siparişiniz bulunmuyor' : 'Sipariş bulunamadı'}
      />
    );
  };

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <FlashList
          contentContainerStyle={{ padding: 12 }}
          contentInsetAdjustmentBehavior="never"
          data={orders}
          ItemSeparatorComponent={() => <YStack height={12} />}
          keyExtractor={(item) => String(item.returnRequestId ?? item.id)}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            orders.length > 0 ? (
              <YStack paddingTop="$4">
                <Pagination currentPage={currentPage} onChange={goToPage} pageCount={pageCount} />
              </YStack>
            ) : null
          }
          ListHeaderComponent={listHeader}
          maintainVisibleContentPosition={{ disabled: true }}
          ref={listRef}
          refreshing={query.isRefetching}
          onRefresh={() => query.refetch()}
          renderItem={({ item }) => (
            <OrderCard
              onPressDetails={() => Alert.alert('Yakında', 'Sipariş detayı yakında eklenecek.')}
              onPressProduct={(slug) => router.push(`/product/${slug}` as never)}
              order={item}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </YStack>
    </AppScreen>
  );
}
