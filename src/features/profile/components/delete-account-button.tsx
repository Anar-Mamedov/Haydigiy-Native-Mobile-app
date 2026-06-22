import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Trash2 } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';
import { ConfirmDialog, SectionCard } from '@/components/ui';
import { useDeactivateAccountMutation } from '@/features/auth/api/auth.mutations';
import { useAuthStore } from '@/features/auth/store/use-auth-store';

/**
 * "Hesabımı Sil" row mirroring the web flow: a destructive confirmation, then
 * `POST /auth/deactivate`, clearing the session and returning to the home screen.
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const deactivate = useDeactivateAccountMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await deactivate.mutateAsync();
      await logout();
      setConfirmOpen(false);
      router.replace('/');
    } catch {
      setConfirmOpen(false);
      Alert.alert('Hata', 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  return (
    <>
      <Pressable
        accessibilityLabel="Hesabımı Sil"
        accessibilityRole="button"
        onPress={() => setConfirmOpen(true)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <SectionCard backgroundColor="$red2" borderColor="$red6" padding="$3.5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$3">
              <Trash2 color="$red10" size={20} />
              <Paragraph color="$red10" fontSize={14} fontWeight="700">
                Hesabımı Sil
              </Paragraph>
            </XStack>
            <ChevronRight color="$red10" size={20} />
          </XStack>
        </SectionCard>
      </Pressable>

      <ConfirmDialog
        cancelLabel="Vazgeç"
        confirmLabel="Evet, Sil"
        description="Bu işlem geri alınamaz ve tüm verileriniz silinecektir."
        destructive
        isConfirming={deactivate.isPending}
        onConfirm={handleConfirm}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Hesabınızı Silmek İstediğinize Emin Misiniz?"
      />
    </>
  );
}
