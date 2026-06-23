import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from '@tamagui/lucide-icons-2';
import { Spinner, YStack } from 'tamagui';
import { AppButton, AppScreen, ConfirmDialog, EmptyState, ScreenHeader } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useAddressesQuery } from '../api/address.queries';
import { useDeleteAddressMutation } from '../api/address.mutations';
import { AddressCard } from '../components/address-card';

/** "Adres Bilgilerim" — lists saved addresses with add/edit/delete actions. */
export function AddressesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const query = useAddressesQuery(isAuthenticated);
  const deleteMutation = useDeleteAddressMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const goToCreate = () => router.push('/(tabs)/address-form');
  const goToEdit = (id: string) => router.push({ pathname: '/(tabs)/address-form', params: { id } });

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteMutation.mutateAsync(pendingDeleteId);
      setPendingDeleteId(null);
    } catch {
      setPendingDeleteId(null);
      Alert.alert('Hata', 'Adres silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Adres Bilgilerim" />;

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
            description="Adreslerinizi görmek için hesabınıza giriş yapın."
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
            description="Adresleriniz yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const addresses = query.data ?? [];

  return (
    <AppScreen header={header}>
      <YStack gap="$4">
        <AppButton
          backgroundColor="$background"
          borderColor="$borderColor"
          borderWidth={1}
          color="$color"
          icon={Plus}
          id="address-add-btn"
          onPress={goToCreate}
          pressStyle={{ backgroundColor: '$backgroundHover' }}
        >
          Yeni Adres Ekle
        </AppButton>

        {addresses.length === 0 ? (
          <EmptyState
            actionLabel="İlk Adresinizi Ekleyin"
            description="Henüz kayıtlı adresiniz bulunmuyor."
            onActionPress={goToCreate}
            primary
            title="Adres Bulunamadı"
          />
        ) : (
          addresses.map((address) => (
            <AddressCard
              address={address}
              key={address.id}
              onDelete={() => setPendingDeleteId(address.id)}
              onEdit={() => goToEdit(address.id)}
            />
          ))
        )}
      </YStack>

      <ConfirmDialog
        cancelLabel="İptal"
        confirmLabel="Sil"
        description="Bu adresi silmek istediğinizden emin misiniz?"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        open={pendingDeleteId !== null}
        title="Adresi Sil"
      />
    </AppScreen>
  );
}
