import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { useFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';

const MIN_BOTTOM_PADDING = 16;

export type ConfirmSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Scrollable summary the user reviews before confirming. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Confirm button label while `isConfirming`. */
  confirmingLabel?: string;
  onConfirm: () => void;
  isConfirming?: boolean;
  testID?: string;
};

/**
 * Theme-aware bottom-sheet confirmation for actions the user should review first
 * (items, amounts, addresses). Header and actions stay pinned while the summary
 * scrolls. For a one-line question use `ConfirmDialog` instead. While confirming,
 * the sheet cannot be dismissed so a running request is never orphaned.
 */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Onayla',
  cancelLabel = 'Vazgeç',
  confirmingLabel = 'İşleniyor...',
  onConfirm,
  isConfirming = false,
  testID = 'confirm-sheet',
}: ConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const maxHeight = useFitSheetMaxHeight();
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);
  const confirmText = isConfirming ? confirmingLabel : confirmLabel;

  const handleOpenChange = (next: boolean) => {
    if (!next && isConfirming) return;
    onOpenChange(next);
  };

  return (
    <Sheet
      dismissOnOverlayPress={!isConfirming}
      modal
      onOpenChange={handleOpenChange}
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
        maxHeight={maxHeight}
        overflow="visible"
        testID={`${testID}-frame`}
      >
        <SheetBottomCover testID={`${testID}-bottom-cover`} />

        <YStack borderBottomColor="$borderColor" borderBottomWidth={1} gap="$1" padding="$4">
          <Paragraph accessibilityRole="header" color="$color" fontSize={17} fontWeight="800">
            {title}
          </Paragraph>
          {description ? (
            <Paragraph color="$color10" fontSize={13} lineHeight={18}>
              {description}
            </Paragraph>
          ) : null}
        </YStack>

        <ScrollView
          alwaysBounceVertical={false}
          bounces={false}
          contentContainerStyle={{ gap: 12, padding: 16 }}
          overScrollMode="never"
          testID={`${testID}-scroll`}
        >
          {children}
        </ScrollView>

        <YStack
          borderTopColor="$borderColor"
          borderTopWidth={1}
          gap="$3"
          padding="$4"
          paddingBottom={bottomPadding}
        >
          <Button
            accessibilityLabel={confirmText}
            accessibilityRole="button"
            accessibilityState={{ busy: isConfirming, disabled: isConfirming }}
            backgroundColor="$brand"
            borderRadius="$4"
            disabled={isConfirming}
            height={48}
            onPress={onConfirm}
            opacity={isConfirming ? 0.7 : 1}
            pressStyle={{ opacity: 0.85 }}
          >
            <XStack alignItems="center" gap="$2">
              {isConfirming ? <Spinner color="white" size="small" /> : null}
              <Paragraph color="white" fontSize={15} fontWeight="700">
                {confirmText}
              </Paragraph>
            </XStack>
          </Button>
          <Button
            accessibilityLabel={cancelLabel}
            accessibilityRole="button"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$4"
            borderWidth={1}
            disabled={isConfirming}
            height={46}
            onPress={() => handleOpenChange(false)}
            opacity={isConfirming ? 0.5 : 1}
            pressStyle={{ backgroundColor: '$backgroundHover' }}
          >
            <Paragraph color="$color" fontWeight="600">
              {cancelLabel}
            </Paragraph>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
