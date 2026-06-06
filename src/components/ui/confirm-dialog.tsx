import { AlertDialog, Button, Paragraph, XStack, YStack } from 'tamagui';

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          backgroundColor="$shadowColor"
          opacity={0.5}
        />
        <AlertDialog.Content
          key="content"
          backgroundColor="$background"
          borderRadius="$6"
          borderWidth={1}
          borderColor="$borderColor"
          width="90%"
          maxWidth={340}
          padding="$5"
        >
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
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$4"
                  accessibilityRole="button"
                >
                  <Paragraph color="$color" fontWeight="600">
                    {cancelLabel}
                  </Paragraph>
                </Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button
                  flex={1}
                  height={44}
                  backgroundColor={destructive ? '$red10' : '$brand'}
                  borderRadius="$4"
                  disabled={isConfirming}
                  opacity={isConfirming ? 0.7 : 1}
                  onPress={onConfirm}
                  accessibilityRole="button"
                >
                  <Paragraph color="white" fontWeight="600">
                    {confirmLabel}
                  </Paragraph>
                </Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
