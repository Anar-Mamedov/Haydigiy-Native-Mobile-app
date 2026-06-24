import { Check } from '@tamagui/lucide-icons-2';
import { AlertDialog, Button, Paragraph, XStack, YStack } from 'tamagui';
import { AppAlertDialog } from '@/components/ui';

type AddToCartSuccessDialogProps = {
  open: boolean;
  onContinue: () => void;
  onGoToCart: () => void;
};

/** Themed "Ürün sepete eklendi" success dialog, mirroring the web add-to-cart modal. */
export function AddToCartSuccessDialog({ open, onContinue, onGoToCart }: AddToCartSuccessDialogProps) {
  return (
    <AppAlertDialog maxWidth={320} onOpenChange={(next) => !next && onContinue()} open={open}>
      <YStack alignItems="center" gap="$4">
        <XStack
          alignItems="center"
          backgroundColor="$green3"
          borderRadius={999}
          height={64}
          justifyContent="center"
          width={64}
        >
          <Check color="$green10" size={32} />
        </XStack>

        <AlertDialog.Title asChild>
          <Paragraph color="$color" fontSize={17} fontWeight="700" textAlign="center">
            Ürün sepete eklendi
          </Paragraph>
        </AlertDialog.Title>

        <YStack gap="$2.5" width="100%">
          <AlertDialog.Action asChild>
            <Button
              accessibilityRole="button"
              backgroundColor="$brand"
              borderRadius="$4"
              height={46}
              onPress={onGoToCart}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="white" fontSize={15} fontWeight="700">
                Sepete Git
              </Paragraph>
            </Button>
          </AlertDialog.Action>
          <AlertDialog.Cancel asChild>
            <Button
              accessibilityRole="button"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              height={46}
              onPress={onContinue}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="$color" fontSize={15} fontWeight="600">
                Alışverişe Devam Et
              </Paragraph>
            </Button>
          </AlertDialog.Cancel>
        </YStack>
      </YStack>
    </AppAlertDialog>
  );
}
