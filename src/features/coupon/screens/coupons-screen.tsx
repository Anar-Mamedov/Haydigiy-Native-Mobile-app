import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Gift } from '@/components/ui/icons';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useCouponsQuery } from '../api/coupon.queries';
import { CouponCard } from '../components/coupon-card';
import { CouponIntroCard } from '../components/coupon-intro-card';
import { Coupon } from '@/types/coupon.types';

export function CouponsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const query = useCouponsQuery(isAuthenticated);

  const coupons = query.data ?? [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="İndirim Kuponlarım" />;

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
            description="İndirim kuponlarınızı görmek için hesabınıza giriş yapın."
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
          description="Kuponlar yüklenirken bir hata oluştu."
          onActionPress={() => query.refetch()}
          primary
          title="Bir Hata Oluştu"
        />
      );
    }
    return (
      <EmptyState
        description="Hesabınıza ait bir kupon bulunamadı."
        icon={<Gift color="$brand" size={32} />}
        title="Kuponunuz Yok"
      />
    );
  };

  return (
    <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
      <FlashList
        contentContainerStyle={{ padding: 16 }}
        data={coupons}
        ItemSeparatorComponent={() => <YStack height={12} />}
        keyExtractor={(item: Coupon) => String(item.id)}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <YStack paddingBottom="$3">
            <CouponIntroCard count={coupons.length} />
          </YStack>
        }
        onRefresh={() => query.refetch()}
        refreshing={query.isRefetching}
        renderItem={({ item }: { item: Coupon }) => <CouponCard coupon={item} />}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}
