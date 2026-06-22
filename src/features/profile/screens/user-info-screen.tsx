import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useUserProfileQuery } from '../api/profile.queries';
import { UserInfoForm } from '../components/user-info-form';
import { DeleteAccountButton } from '../components/delete-account-button';

export function UserInfoScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const query = useUserProfileQuery(isAuthenticated);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Kullanıcı Bilgilerim" />;

  if (authLoading || (isAuthenticated && query.isPending)) {
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
            description="Bilgilerinizi görmek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/(tabs)/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Bilgileriniz yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={header}>
      <UserInfoForm profile={query.data} />
      <DeleteAccountButton />
    </AppScreen>
  );
}
