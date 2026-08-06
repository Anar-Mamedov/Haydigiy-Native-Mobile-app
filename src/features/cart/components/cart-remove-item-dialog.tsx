import { AlertDialog, Button, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppAlertDialog } from '@/components/ui';

type CartRemoveItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Remove the line item from the cart. */
  onRemove: () => void;
  /** Remove the line item and add the product to favorites. */
  onRemoveAndFavorite: () => void;
};

/**
 * Two-action confirmation for removing a cart line. Beyond a plain delete it
 * offers "Sil ve Favorilere Ekle" so a removed product can be kept for later,
 * matching the web cart. Built on the shared AppAlertDialog shell.
 */
export function CartRemoveItemDialog({
  open,
  onOpenChange,
  onRemove,
  onRemoveAndFavorite,
}: CartRemoveItemDialogProps) {
  return (
    <AppAlertDialog onOpenChange={onOpenChange} open={open}>
      <YStack gap="$3">
        <AlertDialog.Title asChild>
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            Ürünü Sil
          </Paragraph>
        </AlertDialog.Title>
        <AlertDialog.Description asChild>
          <Paragraph color="$color10" fontSize={14} lineHeight={20}>
            Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?
          </Paragraph>
        </AlertDialog.Description>

        <YStack gap="$3" marginTop="$2">
          <Button
            accessibilityRole="button"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$4"
            borderWidth={1}
            height={46}
            onPress={onRemove}
          >
            <Paragraph color="$color" fontWeight="600">
              Sil
            </Paragraph>
          </Button>
          <Button
            accessibilityRole="button"
            backgroundColor="$brand"
            borderRadius="$4"
            height={46}
            onPress={onRemoveAndFavorite}
            pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
          >
            <Paragraph color="white" fontWeight="600">
              Sil ve Favorilere Ekle
            </Paragraph>
          </Button>
          <AlertDialog.Cancel asChild>
            <Button accessibilityRole="button" chromeless height={40}>
              <Paragraph color="$color10" fontWeight="600">
                Vazgeç
              </Paragraph>
            </Button>
          </AlertDialog.Cancel>
        </YStack>
      </YStack>
    </AppAlertDialog>
  );
}
