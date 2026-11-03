import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { CopyField } from '@/components/ui/copy-field';
import { CircleCheck } from '@/components/ui/icons';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';

type FeedbackSuccessViewProps = {
  title: string;
  referenceLabel: string;
  reference: string;
  /** Video gönderildiyse kısa bilgi (sözleşme v1.0 §8.2). */
  withVideoNote?: boolean;
  onClose?: () => void;
  onAnother?: () => void;
};

/** Başarı: referans kodu (GB-XXXXXX, kopyalanabilir). Asistan kartında düğmesiz, salt okunur çizilir. */
export function FeedbackSuccessView({ title, referenceLabel, reference, withVideoNote, onClose, onAnother }: FeedbackSuccessViewProps) {
  return (
    <YStack accessibilityLiveRegion="polite" alignItems="stretch" gap="$3" testID="feedback-success">
      <XStack alignItems="center" gap="$2">
        <CircleCheck color="$green10" size={24} />
        <Paragraph color="$color" flex={1} fontSize={15} fontWeight="700">
          {title}
        </Paragraph>
      </XStack>
      <CopyField accessibilityLabel={`${referenceLabel} ${reference} kopyala`} label={referenceLabel} value={reference} />
      {withVideoNote ? (
        <Paragraph color="$color10" fontSize={12}>
          {T.videoNote}
        </Paragraph>
      ) : null}
      {onAnother ? (
        <AppButton backgroundColor="$background" borderColor="$borderColor" borderWidth={1} color="$color" onPress={onAnother}>
          {T.another}
        </AppButton>
      ) : null}
      {onClose ? (
        <AppButton backgroundColor="$brand" borderColor="transparent" color="white" onPress={onClose}>
          {T.close}
        </AppButton>
      ) : null}
    </YStack>
  );
}
