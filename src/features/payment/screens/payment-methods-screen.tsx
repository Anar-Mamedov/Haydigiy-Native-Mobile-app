import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Plus } from '@tamagui/lucide-icons-2';
import { Spinner, YStack } from 'tamagui';
import { AppButton, AppScreen, ConfirmDialog, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { usePaymentMethodsQuery } from '../api/payment.queries';
import { useDeletePaymentMethodMutation } from '../api/payment.mutations';
import { PaymentMethodCard } from '../components/payment-method-card';

/** "Ödeme Bilgilerim" — lists saved refund IBANs with add/edit/delete actions. */
export function PaymentMethodsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const query = usePaymentMethodsQuery(isAuthenticated);
  const deleteMutation = useDeletePaymentMethodMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const goToCreate = () => router.push('/(tabs)/payment-method-form');
  const goToEdit = (id: number) =>
    router.push({ pathname: '/(tabs)/payment-method-form', params: { id: String(id) } });

  const handleConfirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      await deleteMutation.mutateAsync(pendingDeleteId);
      setPendingDeleteId(null);
    } catch {
      setPendingDeleteId(null);
      Alert.alert('Hata', "IBAN silinirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Ödeme Bilgilerim" />;

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
            description="Ödeme bilgilerinizi görmek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/(tabs)/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Ödeme bilgileriniz yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const methods = query.data ?? [];

  return (
    <AppScreen header={header}>
      <YStack gap="$4">
        <AppButton
          backgroundColor="$background"
          borderColor="$borderColor"
          borderWidth={1}
          color="$color"
          icon={Plus}
          id="payment-method-add-btn"
          onPress={goToCreate}
          pressStyle={{ backgroundColor: '$backgroundHover' }}
        >
          Yeni IBAN Ekle
        </AppButton>

        {methods.length === 0 ? (
          <EmptyState
            actionLabel="İlk IBAN'ınızı Ekleyin"
            description="İade işlemleriniz için kullanabileceğiniz bir IBAN ekleyin."
            icon={<CreditCard color="$brand" size={28} />}
            onActionPress={goToCreate}
            primary
            title="Kayıtlı IBAN'ınız bulunamadı"
          />
        ) : (
          methods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onDelete={() => setPendingDeleteId(method.id)}
              onEdit={() => goToEdit(method.id)}
            />
          ))
        )}
      </YStack>

      <ConfirmDialog
        cancelLabel="İptal"
        confirmLabel="Sil"
        description="Bu IBAN'ı silmek istediğinizden emin misiniz?"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        open={pendingDeleteId !== null}
        title="IBAN Sil"
      />
    </AppScreen>
  );
}
