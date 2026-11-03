import { Pressable } from 'react-native';
import { Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { X } from '@/components/ui/icons';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { CustomerFeedbackForm } from './customer-feedback-form';

type CustomerFeedbackSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ürün sayfasından açıldıysa ürünün kimliği (`product_id`). */
  productId?: number | null;
};

/**
 * Yeni geri bildirim formunun alttan açılan sheet'i (kanonik form sheet yapısı, AGENTS.md). Form
 * içeriği unmount'ta silinir; kapatma yalnız dış alana dokunma ve X ile yapılır.
 */
export function CustomerFeedbackSheet({ open, onOpenChange, productId }: CustomerFeedbackSheetProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      moveOnKeyboardChange
      onOpenChange={onOpenChange}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        maxHeight="92%"
        overflow="visible"
        testID="customer-feedback-sheet-frame"
      >
        <SheetBottomCover testID="customer-feedback-sheet-bottom-cover" />
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingBottom="$3"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph accessibilityRole="header" color="$color" fontSize={16} fontWeight="800">
            {T.sheetTitle}
          </Paragraph>
          <Pressable accessibilityLabel={T.close} accessibilityRole="button" hitSlop={12} onPress={close}>
            <X color="$color" size={22} />
          </Pressable>
        </XStack>
        <KeyboardAwareSheetScrollView testID="customer-feedback-keyboard-aware-scroll">
          <YStack padding="$4">
            {open ? <CustomerFeedbackForm onClose={close} productId={productId} /> : null}
          </YStack>
        </KeyboardAwareSheetScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
