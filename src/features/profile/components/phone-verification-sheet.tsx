import type { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, YStack } from 'tamagui';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';

type PhoneVerificationSheetProps = PropsWithChildren<{
  onExit: () => void | Promise<void>;
  open: boolean;
}>;

/** A session-level, non-dismissible surface for mandatory phone verification. */
export function PhoneVerificationSheet({ children, onExit, open }: PhoneVerificationSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Sheet
      disableDrag
      dismissOnOverlayPress={false}
      dismissOnSnapToBottom={false}
      modal
      moveOnKeyboardChange
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) void onExit();
      }}
      open={open}
      snapPoints={[100]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background">
        <KeyboardAwareSheetScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: Math.max(insets.top, 16),
          }}
          testID="phone-verification-keyboard-aware-scroll"
        >
          <YStack
            alignSelf="center"
            gap="$3"
            maxWidth={440}
            paddingHorizontal="$4"
            paddingVertical="$5"
            width="100%"
          >
            {children}
          </YStack>
        </KeyboardAwareSheetScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
