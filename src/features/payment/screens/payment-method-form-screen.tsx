import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { getIbanDigits } from '@/utils/iban';
import { usePaymentMethodsQuery } from '../api/payment.queries';
import {
  PaymentMethodForm,
  EMPTY_PAYMENT_VALUES,
} from '../components/payment-method-form';
import { PaymentMethodFormData } from '../schemas/payment-method.schema';

/** Add/edit IBAN screen. Edit mode is selected by the `id` route param. */
export function PaymentMethodFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const idParam = typeof params.id === 'string' && params.id ? params.id : undefined;
  const methodId = idParam ? Number(idParam) : undefined;
  const isEdit = methodId != null && !Number.isNaN(methodId);

  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  // There is no detail endpoint; the IBAN being edited is read from the cached list.
  const query = usePaymentMethodsQuery(isAuthenticated && isEdit);
  const method = isEdit ? query.data?.find((item) => item.id === methodId) : undefined;

  const editValues = useMemo<PaymentMethodFormData | undefined>(
    () =>
      method
        ? {
            iban: getIbanDigits(method.iban),
            ibanName: method.ibanName,
            isDefault: method.isDefault,
          }
        : undefined,
    [method],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/payment-methods');
    }
  };

  const header = (
    <ScreenHeader onBack={handleBack} title={isEdit ? 'IBAN Düzenle' : 'Yeni IBAN Ekle'} />
  );

  if (authLoading || (isEdit && query.isPending)) {
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
            description="IBAN eklemek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (isEdit && !method) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Geri Dön"
            description="Düzenlenecek IBAN bulunamadı."
            onActionPress={handleBack}
            primary
            title="IBAN Bulunamadı"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen header={header}>
      <PaymentMethodForm
        initialValues={isEdit ? editValues : EMPTY_PAYMENT_VALUES}
        methodId={methodId}
        mode={isEdit ? 'edit' : 'create'}
        onSuccess={handleBack}
      />
    </AppScreen>
  );
}
