import { Bell, Mail } from '@/components/ui/icons';
import { AlertDialog, Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppAlertDialog } from '@/components/ui/app-alert-dialog';

type NotifyStockDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

/** Web'deki "TALEBİNİ ALDIK" modalinin karşılığı. */
export function NotifyStockDialog({ onOpenChange, open }: NotifyStockDialogProps) {
  return (
    <AppAlertDialog maxWidth={340} onOpenChange={onOpenChange} open={open}>
      <YStack alignItems="center" gap="$3" testID="notify-stock-dialog">
        <YStack alignItems="center" justifyContent="center" position="relative">
          <YStack
            alignItems="center"
            borderColor="$borderColor"
            borderRadius={48}
            borderWidth={2}
            height={96}
            justifyContent="center"
            width={96}
          >
            <Mail color="$color10" size={32} />
          </YStack>
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderColor="$background"
            borderRadius={14}
            borderWidth={2}
            height={28}
            justifyContent="center"
            position="absolute"
            right={-2}
            top={-2}
            width={28}
          >
            <Bell color="white" size={15} />
          </XStack>
        </YStack>

        <AlertDialog.Title asChild>
          <Paragraph color="$color" fontSize={18} fontWeight="800" textAlign="center">
            TALEBİNİ ALDIK
          </Paragraph>
        </AlertDialog.Title>

        <AlertDialog.Description asChild>
          <Paragraph color="$color10" fontSize={14} lineHeight={20} textAlign="center">
            Ürün stoğa girdiğinde HaydiGiy için kullandığınız e-posta adresinize bilgilendirme
            yapacağız.
          </Paragraph>
        </AlertDialog.Description>

        <AlertDialog.Action asChild>
          <Button
            backgroundColor="$brand"
            borderRadius="$4"
            borderWidth={0}
            marginTop="$2"
            onPress={() => onOpenChange(false)}
            pressStyle={{ opacity: 0.85 }}
            testID="notify-stock-dialog-confirm"
            width="100%"
          >
            <Paragraph color="white" fontSize={14} fontWeight="700">
              Tamam
            </Paragraph>
          </Button>
        </AlertDialog.Action>
      </YStack>
    </AppAlertDialog>
  );
}
