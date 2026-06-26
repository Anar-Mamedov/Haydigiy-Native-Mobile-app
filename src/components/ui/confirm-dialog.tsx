import { AlertDialog, Button, Paragraph, XStack, YStack } from 'tamagui';
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
  isConfirming,
}: ConfirmDialogProps) {
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
                <Paragraph fontSize={14} color="$color10" textAlign="center" lineHeight={20}>
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
                  disabled={isConfirming}
                  opacity={isConfirming ? 0.7 : 1}
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
