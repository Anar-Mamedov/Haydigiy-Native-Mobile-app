import { VerificationCodeSheet } from '@/features/auth/components/verification-code-sheet';
import { formatTurkishPhoneDisplay } from '@/utils/turkish-phone';
import {
  PHONE_CHANGE_CODE_LENGTH,
  PHONE_CHANGE_CODE_TTL_MINUTES,
} from '../constants/phone-change';

export type PhoneChangeVerificationSheetProps = {
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
  /** The new number the code was sent to. */
  phone: string | null;
};

/**
 * Collects the SMS code that confirms a phone number change under the `v2`
 * profile contract. Purely presentational: `useProfileUpdate` owns the requests,
 * the frozen payload, the cooldown and the messages shown here.
 */
export function PhoneChangeVerificationSheet({ phone, ...sheetProps }: PhoneChangeVerificationSheetProps) {
  const phoneDisplay = phone ? formatTurkishPhoneDisplay(phone) || phone : 'Yeni telefon';

  return (
    <VerificationCodeSheet
      {...sheetProps}
      codeLength={PHONE_CHANGE_CODE_LENGTH}
      copy={{
        title: 'Telefon Numarası Doğrulaması',
        description:
          `${phoneDisplay} numarasına ${PHONE_CHANGE_CODE_LENGTH} haneli bir doğrulama kodu ` +
          'gönderdik. Bilgilerinizin kaydedilmesi için kodu girin. ' +
          `Kod ${PHONE_CHANGE_CODE_TTL_MINUTES} dakika geçerlidir.`,
        codeLabel: `${PHONE_CHANGE_CODE_LENGTH} haneli telefon doğrulama kodu`,
        codeFocusLabel: 'Telefon doğrulama kodunu gir',
        submitLabel: 'Doğrula ve Kaydet',
        submitAccessibilityLabel: 'Doğrula ve kaydet',
      }}
      testIDPrefix="phone-change-verification"
    />
  );
}
