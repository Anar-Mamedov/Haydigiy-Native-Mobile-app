import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { ChangePasswordForm } from '../components/change-password-form';

export function ChangePasswordScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Şifre Değişikliği" />;

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
            description="Şifrenizi değiştirmek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/(tabs)/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={header}>
      <ChangePasswordForm />
    </AppScreen>
  );
}
