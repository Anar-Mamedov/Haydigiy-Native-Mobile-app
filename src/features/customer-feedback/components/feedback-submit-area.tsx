import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';

type FeedbackSubmitAreaProps = {
  submitLabel: string;
  sendingLabel: string;
  canSubmit: boolean;
  submitting: boolean;
  /** Düğme neden pasif — tek satır (sözleşme v1.0 §6.4). */
  disabledReason: string | null;
  blockedSeconds: number;
  generalError: string | null;
  onSubmit: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
};

/** Gönder düğmesi + pasiflik nedeni + genel hata şeridi. Hata form içeriğini asla silmez. */
export function FeedbackSubmitArea({
  submitLabel,
  sendingLabel,
  canSubmit,
  submitting,
  disabledReason,
  blockedSeconds,
  generalError,
  onSubmit,
  cancelLabel,
  onCancel,
}: FeedbackSubmitAreaProps) {
  const label = submitting ? sendingLabel : generalError && !blockedSeconds ? T.retry : submitLabel;

  return (
    <YStack gap="$2">
      {generalError ? (
        <YStack
          accessibilityLiveRegion="assertive"
          backgroundColor="$red2"
          borderColor="$red7"
          borderRadius="$3"
          borderWidth={1}
          padding="$3"
          testID="feedback-general-error"
        >
          <Paragraph color="$red11" fontSize={13}>
            {generalError}
          </Paragraph>
        </YStack>
      ) : null}
      <AppButton
        accessibilityState={{ disabled: !canSubmit, busy: submitting }}
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={!canSubmit}
        icon={submitting ? <Spinner color="white" size="small" /> : undefined}
        onPress={onSubmit}
        opacity={canSubmit ? 1 : 0.6}
        testID="feedback-submit"
      >
        {blockedSeconds > 0 ? `${submitLabel} (${blockedSeconds})` : label}
      </AppButton>
      {disabledReason && !submitting ? (
        <Paragraph color="$color10" fontSize={12} testID="feedback-submit-reason">
          {disabledReason}
        </Paragraph>
      ) : null}
      {onCancel && cancelLabel ? (
        <AppButton
          backgroundColor="$background"
          borderColor="$borderColor"
          borderWidth={1}
          color="$color"
          disabled={submitting}
          onPress={onCancel}
        >
          {cancelLabel}
        </AppButton>
      ) : null}
    </YStack>
  );
}
