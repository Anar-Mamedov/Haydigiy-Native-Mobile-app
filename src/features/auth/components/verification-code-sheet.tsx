import { Button, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { X } from '@/components/ui/icons';
import { AppButton } from '@/components/ui/app-button';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { formatOtpCooldown } from '../utils/otp-delivery';

/** Texts that tell one verification flow from another. */
export type VerificationCodeSheetCopy = {
  title: string;
  /** Where the code went and what confirming it does. */
  description: string;
  /** Accessible name of the code field, e.g. "6 haneli e-posta doğrulama kodu". */
  codeLabel: string;
  /** Accessible name of the tap target that focuses the code field. */
  codeFocusLabel: string;
  submitLabel: string;
  submitAccessibilityLabel: string;
};

/** `danger` paints the submit button red for an irreversible action (account deletion). */
export type VerificationCodeSheetSubmitTone = 'brand' | 'danger';

const SUBMIT_TONE_STYLES = {
  brand: { backgroundColor: '$brand', pressedOpacity: 0.85 },
  danger: { backgroundColor: '$red10', pressedOpacity: 0.8 },
} as const;

export type VerificationCodeSheetProps = {
  copy: VerificationCodeSheetCopy;
  codeLength: number;
  submitTone?: VerificationCodeSheetSubmitTone;
  /** Prefix of every test ID: `<prefix>-sheet-frame`, `<prefix>-code-input`, … */
  testIDPrefix: string;
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
 * Bottom sheet that collects a one-time verification code: code field, submit,
 * resend with countdown and cancel. Purely presentational; the owning feature hook
 * sends the requests, counts the cooldown and decides the messages.
 */
export function VerificationCodeSheet({
  code,
  codeLength,
  cooldownSeconds,
  copy,
  errorMessage,
  infoMessage,
  isResending,
  isVerifying,
  onCancel,
  onChangeCode,
  onResend,
  onSubmit,
  open,
  submitTone = 'brand',
  testIDPrefix,
}: VerificationCodeSheetProps) {
  const isCoolingDown = cooldownSeconds > 0;
  const canSubmit = code.length === codeLength && !isVerifying;
  const submitStyle = SUBMIT_TONE_STYLES[submitTone];

  // An incomplete code or an in-flight request must not fire a second verification.
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
        testID={`${testIDPrefix}-sheet-frame`}
      >
        <SheetBottomCover testID={`${testIDPrefix}-sheet-bottom-cover`} />

        {/* Fixed header: stays pinned while the form scrolls. */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            {copy.title}
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

        <KeyboardAwareSheetScrollView testID={`${testIDPrefix}-keyboard-aware-scroll`}>
          <YStack gap="$4" paddingHorizontal="$4" paddingTop="$3">
            <Paragraph color="$color10" fontSize={14} lineHeight={20}>
              {copy.description}
            </Paragraph>

            {/* Closed modal sheets stay mounted, so the field is only focused (and the
                keyboard raised) when the sheet actually opens. */}
            <OtpCodeInput
              accessibilityLabel={copy.codeLabel}
              autoFocus={open}
              disabled={isVerifying}
              focusAccessibilityLabel={copy.codeFocusLabel}
              key={open ? 'open' : 'closed'}
              length={codeLength}
              onChangeText={onChangeCode}
              testID={`${testIDPrefix}-code-input`}
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
              accessibilityLabel={copy.submitAccessibilityLabel}
              accessibilityState={{ disabled: !canSubmit }}
              backgroundColor={submitStyle.backgroundColor}
              borderColor="transparent"
              color="white"
              disabled={!canSubmit}
              onPress={handleSubmit}
              opacity={canSubmit ? 1 : 0.5}
              pressStyle={{ opacity: submitStyle.pressedOpacity }}
              testID={`${testIDPrefix}-submit`}
            >
              {isVerifying ? <Spinner color="white" /> : copy.submitLabel}
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
