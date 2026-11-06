import { VerificationCodeSheet } from '@/features/auth/components/verification-code-sheet';
import { ACCOUNT_DELETION_CODE_LENGTH } from '@/features/profile/constants/account-deletion';

export type DeleteAccountVerificationSheetProps = {
  code: string;
  /** Seconds left before a new code may be requested. */
  cooldownSeconds: number;
  errorMessage?: string | null;
  infoMessage?: string | null;
  isResending: boolean;
  isVerifying: boolean;
  onCancel: () => void;
  onChangeCode: (code: string) => void;
  onResend: () => void;
  onSubmit: () => void;
  open: boolean;
};

/**
 * Collects the SMS code that confirms account deletion under the `v2` contract.
 * Purely presentational: `useAccountDeletion` owns the requests, the cooldown
 * and the messages shown here. The shared sheet ignores an incomplete code or a
 * press while the request is in flight, so a second delete call cannot fire.
 */
export function DeleteAccountVerificationSheet(props: DeleteAccountVerificationSheetProps) {
  return (
    <VerificationCodeSheet
      {...props}
      codeLength={ACCOUNT_DELETION_CODE_LENGTH}
      copy={{
        title: 'Hesap Silme Doğrulaması',
        description:
          `Kayıtlı telefon numaranıza ${ACCOUNT_DELETION_CODE_LENGTH} haneli bir doğrulama kodu ` +
          'gönderdik. Hesabınızın silinmesi için kodu girin.',
        codeLabel: `${ACCOUNT_DELETION_CODE_LENGTH} haneli hesap silme doğrulama kodu`,
        codeFocusLabel: 'Hesap silme doğrulama kodunu gir',
        submitLabel: 'Doğrula ve Hesabımı Sil',
        submitAccessibilityLabel: 'Hesabımı sil',
      }}
      submitTone="danger"
      testIDPrefix="delete-account-verification"
    />
  );
}
