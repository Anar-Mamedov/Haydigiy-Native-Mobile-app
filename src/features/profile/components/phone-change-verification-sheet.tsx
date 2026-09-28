import { Button, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { X } from '@/components/ui/icons';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { formatOtpCooldown } from '@/features/auth/utils/otp-delivery';
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
export function PhoneChangeVerificationSheet({
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
  phone,
}: PhoneChangeVerificationSheetProps) {
  const isCoolingDown = cooldownSeconds > 0;
  const canSubmit = code.length === PHONE_CHANGE_CODE_LENGTH && !isVerifying;
  const phoneDisplay = phone ? formatTurkishPhoneDisplay(phone) || phone : 'Yeni telefon';

  // An incomplete code or an in-flight request must not fire a second save.
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
        testID="phone-change-verification-sheet-frame"
      >
        <SheetBottomCover testID="phone-change-verification-sheet-bottom-cover" />

        {/* Fixed header: stays pinned while the form scrolls. */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            Telefon Numarası Doğrulaması
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

        <KeyboardAwareSheetScrollView testID="phone-change-verification-keyboard-aware-scroll">
          <YStack gap="$4" paddingHorizontal="$4" paddingTop="$3">
            <Paragraph color="$color10" fontSize={14} lineHeight={20}>
              {phoneDisplay} numarasına {PHONE_CHANGE_CODE_LENGTH} haneli bir doğrulama kodu
              gönderdik. Bilgilerinizin kaydedilmesi için kodu girin. Kod{' '}
              {PHONE_CHANGE_CODE_TTL_MINUTES} dakika geçerlidir.
            </Paragraph>

            {/* Closed modal sheets stay mounted, so the field is only focused (and the
                keyboard raised) when the sheet actually opens. */}
            <OtpCodeInput
              accessibilityLabel={`${PHONE_CHANGE_CODE_LENGTH} haneli telefon doğrulama kodu`}
              autoFocus={open}
              disabled={isVerifying}
              focusAccessibilityLabel="Telefon doğrulama kodunu gir"
              key={open ? 'open' : 'closed'}
              length={PHONE_CHANGE_CODE_LENGTH}
              onChangeText={onChangeCode}
              testID="phone-change-verification-code-input"
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
              accessibilityLabel="Doğrula ve kaydet"
              accessibilityState={{ disabled: !canSubmit }}
              backgroundColor="$brand"
              borderColor="transparent"
              color="white"
              disabled={!canSubmit}
              onPress={handleSubmit}
              opacity={canSubmit ? 1 : 0.5}
              pressStyle={{ opacity: 0.85 }}
            >
              {isVerifying ? <Spinner color="white" /> : 'Doğrula ve Kaydet'}
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
