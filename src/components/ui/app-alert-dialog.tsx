import type { ComponentProps, ReactNode } from 'react';
import { AlertDialog } from 'tamagui';

type AlertDialogOverlayProps = ComponentProps<typeof AlertDialog.Overlay>;

export type AppAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  maxWidth?: number;
  overlayBackgroundColor?: AlertDialogOverlayProps['backgroundColor'];
  overlayOpacity?: number;
};

/**
 * Shared, theme-aware modal shell built on Tamagui's AlertDialog. Centralizes the
 * portal + overlay + content structure and surface styling so every dialog
 * (confirmations, cart actions, notices) composes one primitive instead of
 * re-implementing the modal frame. Children may use `AlertDialog.Title`,
 * `Description`, `Cancel` and `Action` since they render inside the dialog context.
 */
export function AppAlertDialog({
  open,
  onOpenChange,
  children,
  maxWidth = 360,
  overlayBackgroundColor = '$shadowColor',
  overlayOpacity = 0.5,
}: AppAlertDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          backgroundColor={overlayBackgroundColor}
          key="overlay"
          opacity={overlayOpacity}
        />
        <AlertDialog.Content
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$6"
          borderWidth={1}
          key="content"
          maxWidth={maxWidth}
          padding="$5"
          width="90%"
        >
          {children}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
