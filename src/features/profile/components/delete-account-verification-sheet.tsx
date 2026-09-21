import { Button, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { X } from '@/components/ui/icons';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { ACCOUNT_DELETION_CODE_LENGTH } from '@/features/profile/constants/account-deletion';
import { formatOtpCooldown } from '@/features/auth/utils/otp-delivery';

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
 * and the messages shown here.
 */
export function DeleteAccountVerificationSheet({
  code,
  cooldownSeconds,
  errorMessage,
  infoMessage,
  isResending,
  isVerifying,
  onCancel,
  onChangeCode,
  onResend,
  onSubmit,
  open,
}: DeleteAccountVerificationSheetProps) {
  const isCoolingDown = cooldownSeconds > 0;
  const isCodeComplete = code.length === ACCOUNT_DELETION_CODE_LENGTH;
  const canSubmit = isCodeComplete && !isVerifying;

  // A destructive action never leans on the disabled styling alone: an incomplete
  // code or an in-flight request must not be able to fire a second delete call.
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit();
  };

  const handleResend = () => {
    if (isResending || isCoolingDown) return;
    onResend();
  };

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      moveOnKeyboardChange
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onCancel();
      }}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        maxHeight="92%"
        overflow="visible"
        testID="delete-account-verification-sheet-frame"
      >
        <SheetBottomCover testID="delete-account-verification-sheet-bottom-cover" />

        {/* Fixed header: stays pinned while the form scrolls. */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            Hesap Silme Doğrulaması
          </Paragraph>
          <Button
            accessibilityLabel="Doğrulamayı kapat"
            accessibilityRole="button"
            chromeless
            circular
            icon={<X color="$color10" size={20} />}
            onPress={onCancel}
            padding={0}
            size="$2"
          />
        </XStack>

        <KeyboardAwareSheetScrollView testID="delete-account-verification-keyboard-aware-scroll">
          <YStack gap="$4" paddingHorizontal="$4" paddingTop="$3">
            <Paragraph color="$color10" fontSize={14} lineHeight={20}>
              Kayıtlı telefon numaranıza {ACCOUNT_DELETION_CODE_LENGTH} haneli bir doğrulama kodu
              gönderdik. Hesabınızın silinmesi için kodu girin.
            </Paragraph>

            <OtpCodeInput
              accessibilityLabel={`${ACCOUNT_DELETION_CODE_LENGTH} haneli hesap silme doğrulama kodu`}
              autoFocus
              disabled={isVerifying}
              focusAccessibilityLabel="Hesap silme doğrulama kodunu gir"
              length={ACCOUNT_DELETION_CODE_LENGTH}
              onChangeText={onChangeCode}
              testID="delete-account-verification-code-input"
              value={code}
            />

            {errorMessage ? (
              <Paragraph color="$red10" fontWeight="500" size="$2" textAlign="center">
                {errorMessage}
              </Paragraph>
            ) : infoMessage ? (
              <Paragraph color="$green10" fontWeight="500" size="$2" textAlign="center">
                {infoMessage}
              </Paragraph>
            ) : null}

            <AppButton
              accessibilityLabel="Hesabımı sil"
              accessibilityState={{ disabled: !canSubmit }}
              backgroundColor="$red10"
              borderColor="transparent"
              color="white"
              disabled={!canSubmit}
              onPress={handleSubmit}
              opacity={canSubmit ? 1 : 0.5}
              pressStyle={{ opacity: 0.8 }}
            >
              {isVerifying ? <Spinner color="white" /> : 'Doğrula ve Hesabımı Sil'}
            </AppButton>

            <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$1">
              {isCoolingDown ? (
                <Paragraph color="$color10" size="$2">
                  Kalan Süre:{' '}
                  <Paragraph color="$color" fontWeight="700" size="$2">
                    {formatOtpCooldown(cooldownSeconds)}
                  </Paragraph>
                </Paragraph>
              ) : (
                <Button
                  accessibilityLabel="Doğrulama kodunu tekrar gönder"
                  accessibilityState={{ disabled: isResending }}
                  chromeless
                  disabled={isResending}
                  onPress={handleResend}
                  padding={0}
                  pressStyle={{ opacity: 0.6 }}
                  size="$2"
                >
                  <Paragraph color="$brand" fontWeight="700" size="$2">
                    {isResending ? 'Gönderiliyor...' : 'Kodu Tekrar Gönder'}
                  </Paragraph>
                </Button>
              )}

              <Button
                accessibilityLabel="Vazgeç"
                chromeless
                onPress={onCancel}
                padding={0}
                pressStyle={{ opacity: 0.6 }}
                size="$2"
              >
                <Paragraph color="$color10" size="$2" textDecorationLine="underline">
                  Vazgeç
                </Paragraph>
              </Button>
            </XStack>
          </YStack>
        </KeyboardAwareSheetScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
