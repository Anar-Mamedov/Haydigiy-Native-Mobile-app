import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { ResetPasswordForm } from '../components/reset-password-form';

function firstParam(value: string | string[] | undefined): string | undefined {
  const param = Array.isArray(value) ? value[0] : value;
  const trimmed = param?.trim();
  return trimmed || undefined;
}

export function ResetPasswordScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string | string[] }>();
  const token = firstParam(tokenParam);

  const goToLogin = () => router.replace('/profile');
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      goToLogin();
    }
  };

  return (
    <AppScreen
      header={<ScreenHeader onBack={handleBack} title="Şifre Sıfırlama" />}
      scrollable={Boolean(token)}
    >
      {token ? (
        <ResetPasswordForm onSuccess={goToLogin} token={token} />
      ) : (
        <YStack flex={1} justifyContent="center">
          <EmptyState
            actionLabel="Giriş Sayfasına Dön"
            description="Şifre sıfırlama bağlantısı geçersiz veya eksik. Yeni bir bağlantı isteyebilirsiniz."
            onActionPress={goToLogin}
            primary
            title="Bağlantı Bulunamadı"
          />
        </YStack>
      )}
    </AppScreen>
  );
}
