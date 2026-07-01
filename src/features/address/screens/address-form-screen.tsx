import { useCallback, useMemo } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, KeyboardAwareFormScrollView, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { extractTurkishNationalNumber } from '@/utils/turkish-phone';
import { AddressFormValues } from '@/types/address.types';
import { useAddressQuery } from '../api/address.queries';
import { AddressForm, EMPTY_ADDRESS_VALUES } from '../components/address-form';

const ADDRESS_FORM_KEYBOARD_BOTTOM_OFFSET = 96;

/** Add/edit address screen. Edit mode is selected by the `id` route param. */
export function AddressFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' && params.id ? params.id : undefined;
  const isEdit = Boolean(id);

  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const user = useAuthStore((state) => state.user);
  const detailQuery = useAddressQuery(isEdit ? id : undefined);

  // New addresses start with the signed-in user's name, surname and phone
  // prefilled (mirroring the web add form), so the user only completes location
  // and address details. Memoized so the reference stays stable for the form's
  // focus-reset effect.
  const createDefaults = useMemo<AddressFormValues>(
    () => ({
      ...EMPTY_ADDRESS_VALUES,
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      phone: user?.phoneNumber ? extractTurkishNationalNumber(user.phoneNumber) : '',
    }),
    [user?.name, user?.surname, user?.phoneNumber],
  );

  // When editing, refetch the address from the API every time the screen regains
  // focus so reopening the form always shows the latest saved values rather than
  // stale, uncommitted edits from a previous visit.
  const { refetch } = detailQuery;
  useFocusEffect(
    useCallback(() => {
      if (isEdit) refetch();
    }, [isEdit, refetch]),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/addresses');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title={isEdit ? 'Adres Düzenle' : 'Adres Ekle'} />;

  if (authLoading || (isEdit && detailQuery.isPending)) {
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
            description="Adres eklemek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/(tabs)/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (isEdit && (detailQuery.isError || !detailQuery.data)) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Adres bilgileri yüklenirken bir hata oluştu."
            onActionPress={() => detailQuery.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <KeyboardAwareFormScrollView
        bottomOffset={ADDRESS_FORM_KEYBOARD_BOTTOM_OFFSET}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        testID="address-form-keyboard-aware-scroll"
      >
        <AddressForm
          addressId={id}
          initialValues={isEdit ? (detailQuery.data ?? undefined) : createDefaults}
          mode={isEdit ? 'edit' : 'create'}
          onSuccess={handleBack}
        />
      </KeyboardAwareFormScrollView>
    </AppScreen>
  );
}
