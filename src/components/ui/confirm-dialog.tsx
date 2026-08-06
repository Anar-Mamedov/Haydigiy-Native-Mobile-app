import { AlertDialog, Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppAlertDialog } from '@/components/ui/app-alert-dialog';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  descriptionTone?: 'default' | 'danger';
  confirmDisabled?: boolean;
  isConfirming?: boolean;
};

/**
 * Theme-aware confirmation dialog built on Tamagui primitives. Reused across the app
 * for destructive or important confirmations so screens do not hand-roll modals.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  onConfirm,
  destructive,
  descriptionTone = 'default',
  confirmDisabled = false,
  isConfirming,
}: ConfirmDialogProps) {
  const isConfirmUnavailable = confirmDisabled || Boolean(isConfirming);

  return (
    <AppAlertDialog maxWidth={340} onOpenChange={onOpenChange} open={open}>
      <YStack gap="$3">
            <AlertDialog.Title asChild>
              <Paragraph fontSize={16} fontWeight="700" color="$color" textAlign="center">
                {title}
              </Paragraph>
            </AlertDialog.Title>

            {description ? (
              <AlertDialog.Description asChild>
                <Paragraph
                  color={descriptionTone === 'danger' ? '$red10' : '$color10'}
                  fontSize={14}
                  lineHeight={20}
                  selectable
                  textAlign="center"
                >
                  {description}
                </Paragraph>
              </AlertDialog.Description>
            ) : null}

            <XStack gap="$3" marginTop="$2">
              <AlertDialog.Cancel asChild>
                <Button
                  flex={1}
                  height={44}
                  paddingHorizontal={0}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$4"
                  accessibilityRole="button"
                >
                  <Paragraph
                    color="$color"
                    fontWeight="600"
                    numberOfLines={1}
                    textAlign="center"
                  >
                    {cancelLabel}
                  </Paragraph>
                </Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button
                  flex={1}
                  height={44}
                  paddingHorizontal={0}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={destructive ? '$red10' : '$brand'}
                  borderRadius="$4"
                  disabled={isConfirmUnavailable}
                  opacity={isConfirmUnavailable ? 0.5 : 1}
                  onPress={onConfirm}
                  accessibilityRole="button"
                >
                  <Paragraph
                    color="white"
                    fontWeight="600"
                    numberOfLines={1}
                    textAlign="center"
                  >
                    {confirmLabel}
                  </Paragraph>
                </Button>
              </AlertDialog.Action>
            </XStack>
      </YStack>
    </AppAlertDialog>
  );
}
