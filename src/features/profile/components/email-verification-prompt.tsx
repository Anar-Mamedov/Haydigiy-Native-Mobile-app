import { Alert } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CompactButton } from '@/components/ui/compact-button';
import { Check } from '@/components/ui/icons';
import {
  VerificationCodeSheet,
  type VerificationCodeSheetCopy,
} from '@/features/auth/components/verification-code-sheet';
import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_CODE_TTL_MINUTES,
} from '../constants/email-verification';
import { useEmailVerification } from '../hooks/use-email-verification';

type EmailVerificationPromptProps = {
  /** The saved, not yet verified address. */
  email: string;
};

function buildSheetCopy(email: string): VerificationCodeSheetCopy {
  return {
    title: 'E-posta Doğrulama',
    description:
      `${email} adresine ${EMAIL_VERIFICATION_CODE_LENGTH} haneli bir doğrulama kodu gönderdik. ` +
      `Kod ${EMAIL_VERIFICATION_CODE_TTL_MINUTES} dakika geçerlidir. ` +
      'Gelen kutunuzda göremiyorsanız istenmeyen (spam) klasörüne bakın.',
    codeLabel: `${EMAIL_VERIFICATION_CODE_LENGTH} haneli e-posta doğrulama kodu`,
    codeFocusLabel: 'E-posta doğrulama kodunu gir',
    submitLabel: 'Doğrula',
    submitAccessibilityLabel: 'E-postayı doğrula',
  };
}

/** Orange disc with a white tick, as on the web card. */
function NoticeTick() {
  return (
    <YStack
      alignItems="center"
      backgroundColor="$notice"
      borderRadius={12}
      height={24}
      justifyContent="center"
      width={24}
    >
      <Check color="white" size={14} strokeWidth={3} />
    </YStack>
  );
}

/**
 * The web's "E-Posta Adresinizi Doğrulamanız Gerekmektedir" card, shown above the profile
 * form: "Doğrula" sends a code to the saved address and opens the code sheet.
 */
export function EmailVerificationPrompt({ email }: EmailVerificationPromptProps) {
  const verification = useEmailVerification({
    email,
    onVerified: () => Alert.alert('Başarılı', 'E-posta adresiniz doğrulandı.'),
  });

  return (
    <YStack gap="$2">
      <XStack
        alignItems="center"
        backgroundColor="$noticeBackground"
        borderColor="$noticeBorder"
        borderRadius="$3"
        borderWidth={1}
        gap="$3"
        justifyContent="space-between"
        paddingHorizontal={16}
        // 10dp plus the button's own 6dp touch margin = the web card's 16dp around the button.
        paddingVertical={10}
        testID="email-verification-card"
      >
        <XStack alignItems="center" flex={1} gap="$2">
          <NoticeTick />
          <Paragraph color="$notice" flex={1} fontSize={14}>
            E-Posta Adresinizi Doğrulamanız Gerekmektedir
          </Paragraph>
        </XStack>
        <CompactButton
          accessibilityLabel="E-posta adresini doğrula"
          backgroundColor="$notice"
          busy={verification.isStarting}
          color="white"
          label={verification.isStarting ? 'Gönderiliyor...' : 'Doğrula'}
          onPress={() => void verification.start()}
          testID="email-verification-start"
        />
      </XStack>

      {verification.startError ? (
        <Paragraph color="$red10" fontSize={13}>
          {verification.startError}
        </Paragraph>
      ) : null}

      <VerificationCodeSheet
        code={verification.code}
        codeLength={EMAIL_VERIFICATION_CODE_LENGTH}
        cooldownSeconds={verification.cooldownSeconds}
        copy={buildSheetCopy(email)}
        errorMessage={verification.errorMessage}
        infoMessage={verification.infoMessage}
        isResending={verification.isResending}
        isVerifying={verification.isVerifying}
        onCancel={verification.cancel}
        onChangeCode={verification.setCode}
        onResend={() => void verification.resendCode()}
        onSubmit={() => void verification.submitCode()}
        open={verification.isOpen}
        testIDPrefix="email-verification"
      />
    </YStack>
  );
}
