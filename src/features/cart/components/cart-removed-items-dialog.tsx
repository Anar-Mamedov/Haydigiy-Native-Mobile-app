import { AlertDialog, Button, Paragraph, XStack, YStack } from 'tamagui';
import { TriangleAlert } from '@tamagui/lucide-icons-2';
import { AppAlertDialog } from '@/components/ui';

type CartRemovedItemsDialogProps = {
  open: boolean;
  message: string | null;
  onClose: () => void;
};

/**
 * Informs the user when the backend dropped out-of-stock lines from the cart
 * (the `message`/`removed_items` payload of `/cart/list`), matching the web
 * "Sepetiniz Güncellendi" modal. Built on the shared AppAlertDialog shell.
 */
export function CartRemovedItemsDialog({ open, message, onClose }: CartRemovedItemsDialogProps) {
  return (
    <AppAlertDialog onOpenChange={(next) => !next && onClose()} open={open}>
      <YStack alignItems="center" gap="$3">
        <XStack
          alignItems="center"
          backgroundColor="$yellow4"
          borderRadius={100}
          height={56}
          justifyContent="center"
          width={56}
        >
          <TriangleAlert color="$yellow10" size={28} />
        </XStack>
        <AlertDialog.Title asChild>
          <Paragraph color="$color" fontSize={16} fontWeight="700" textAlign="center">
            Sepetiniz Güncellendi
          </Paragraph>
        </AlertDialog.Title>
        <AlertDialog.Description asChild>
          <Paragraph color="$color10" fontSize={14} lineHeight={20} textAlign="center">
            {message}
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
