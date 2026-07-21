import { AlertDialog, Button, Paragraph, XStack, YStack } from 'tamagui';
import { AppAlertDialog } from '@/components/ui/app-alert-dialog';

export type AppUpdateDialogProps = {
  open: boolean;
  isOpeningStore: boolean;
  errorMessage: string | null;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function AppUpdateDialog({
  open,
  isOpeningStore,
  errorMessage,
  onDismiss,
  onConfirm,
}: AppUpdateDialogProps) {
  return (
    <AppAlertDialog
      maxWidth={360}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isOpeningStore) {
          onDismiss();
        }
      }}
      open={open}
    >
      <YStack gap="$4">
        <AlertDialog.Title asChild>
          <Paragraph color="$color" fontSize={17} fontWeight="700" textAlign="center">
            Uygulamanın Yeni Sürümü Yayınlandı. Güncellemek İstiyor musunuz?
          </Paragraph>
        </AlertDialog.Title>

        <AlertDialog.Description asChild>
          <Paragraph color="$color10" fontSize={14} lineHeight={20} textAlign="center">
            Güncelleme sayfasını açmak için Evet seçeneğine dokunun.
          </Paragraph>
        </AlertDialog.Description>

        {errorMessage ? (
          <Paragraph
            accessibilityLiveRegion="polite"
            color="$red10"
            fontSize={13}
            role="alert"
            selectable
            textAlign="center"
          >
            {errorMessage}
          </Paragraph>
        ) : null}

        <XStack gap="$3">
          <Button
            accessibilityLabel="Hayır"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderRadius="$4"
            borderWidth={1}
            disabled={isOpeningStore}
            flex={1}
            height={44}
            onPress={onDismiss}
          >
            <Paragraph color="$color" fontWeight="600">
              Hayır
            </Paragraph>
          </Button>

          <Button
            accessibilityLabel="Evet"
            backgroundColor="$brand"
            borderRadius="$4"
            disabled={isOpeningStore}
            flex={1}
            height={44}
            onPress={onConfirm}
            opacity={isOpeningStore ? 0.6 : 1}
          >
            <Paragraph color="white" fontWeight="600">
              {isOpeningStore ? 'Açılıyor...' : 'Evet'}
            </Paragraph>
          </Button>
        </XStack>
      </YStack>
    </AppAlertDialog>
  );
}
