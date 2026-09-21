import { useEffect } from 'react';
import { Alert, Pressable } from 'react-native';
import { ChevronRight, Trash2 } from '@/components/ui/icons';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ConfirmDialog, SectionCard } from '@/components/ui';
import { DeleteAccountVerificationSheet } from '@/features/profile/components/delete-account-verification-sheet';
import { useAccountDeletion } from '@/features/profile/hooks/use-account-deletion';

/**
 * "Hesabımı Sil" row mirroring the web flow: a destructive confirmation, then
 * `POST /auth/deactivate`. Under the `v2` contract the confirmation only asks the
 * backend for an SMS code and the sheet below closes the account once the code is
 * verified; under `v1` the confirmation closes it directly. Either way the session
 * is cleared and the user returns to the home screen.
 */
export function DeleteAccountButton() {
  const deletion = useAccountDeletion();
  const { dismissStartError, startError } = deletion;

  // A failure before the code screen opens has no surface of its own, so it is
  // reported the same way the flow always reported it: a native alert.
  useEffect(() => {
    if (!startError) return;

    Alert.alert('Hata', startError, [{ onPress: dismissStartError, text: 'Tamam' }]);
  }, [dismissStartError, startError]);

  return (
    <>
      <Pressable
        accessibilityLabel="Hesabımı Sil"
        accessibilityRole="button"
        onPress={deletion.openConfirm}
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
        isConfirming={deletion.isStarting}
        onConfirm={() => void deletion.startDeletion()}
        onOpenChange={deletion.setIsConfirmOpen}
        open={deletion.isConfirmOpen}
        title="Hesabınızı Silmek İstediğinize Emin Misiniz?"
      />

      <DeleteAccountVerificationSheet
        code={deletion.code}
        cooldownSeconds={deletion.cooldownSeconds}
        errorMessage={deletion.errorMessage}
        infoMessage={deletion.infoMessage}
        isResending={deletion.isResending}
        isVerifying={deletion.isVerifying}
        onCancel={deletion.cancelVerification}
        onChangeCode={deletion.setCode}
        onResend={() => void deletion.resendCode()}
        onSubmit={() => void deletion.submitCode()}
        open={deletion.isVerificationOpen}
      />
    </>
  );
}
