import { AlertDialog, Button, XStack, YStack } from 'tamagui';
import { CircleCheck } from '@/components/ui/icons';
import { AppAlertDialog } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { FEEDBACK_TEXTS } from '../constants/feedback-texts';

type FeedbackSuccessDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** Gönderim sonrası teşekkür penceresi (web `SuccessModal`). */
export function FeedbackSuccessDialog({ open, onClose }: FeedbackSuccessDialogProps) {
  return (
    <AppAlertDialog onOpenChange={(next) => !next && onClose()} open={open}>
      <YStack alignItems="center" gap="$3">
        <XStack alignItems="center" backgroundColor="$green4" borderRadius={100} height={56} justifyContent="center" width={56}>
          <CircleCheck color="$green10" size={28} />
        </XStack>
        <AlertDialog.Description asChild>
          <Paragraph color="$color" fontSize={15} fontWeight="600" lineHeight={21} textAlign="center">
            {FEEDBACK_TEXTS.success}
          </Paragraph>
        </AlertDialog.Description>
        <AlertDialog.Action asChild>
          <Button
            accessibilityRole="button"
            backgroundColor="$brand"
            borderRadius="$4"
            height={46}
            onPress={onClose}
            pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
            width="100%"
          >
            <Paragraph color="white" fontWeight="700">
              Tamam
            </Paragraph>
          </Button>
        </AlertDialog.Action>
      </YStack>
    </AppAlertDialog>
  );
}
