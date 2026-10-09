import { PropsWithChildren, useRef } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { YStack } from 'tamagui';
import { shouldDismissOnPullRelease } from '@/utils/pull-to-dismiss';

/** Downward swipe (px) on the sheet header past which releasing closes the sheet. */
export const SHEET_SWIPE_CLOSE_DISTANCE = 96;

type SheetSwipeCloseAreaProps = PropsWithChildren<{
  onClose: () => void;
  /** Set true while the sheet must stay open (e.g. a request is running). */
  disabled?: boolean;
  testID?: string;
}>;

type TouchStart = { pageY: number; timestamp: number };

/**
 * Sheet header (with a drag handle) that closes the sheet when swiped down.
 *
 * It only observes raw touch events and never claims the responder, so the Tamagui sheet
 * keeps following the finger with its own drag. Unlike `dismissOnSnapToBottom` it adds no
 * bottom snap point, so it is safe on form sheets with `moveOnKeyboardChange`: keyboard
 * show/hide can never dismiss the sheet, only a swipe that starts on the header can.
 */
export function SheetSwipeCloseArea({ children, onClose, disabled = false, testID }: SheetSwipeCloseAreaProps) {
  const touchStartRef = useRef<TouchStart | null>(null);

  const handleTouchStart = (event: GestureResponderEvent) => {
    const { pageY, timestamp } = event.nativeEvent;
    touchStartRef.current = { pageY, timestamp };
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || disabled) return;

    const distance = event.nativeEvent.pageY - start.pageY;
    const durationMs = Math.max(1, event.nativeEvent.timestamp - start.timestamp);
    const velocityY = (distance / durationMs) * 1000;
    if (shouldDismissOnPullRelease(distance, velocityY, SHEET_SWIPE_CLOSE_DISTANCE)) {
      onClose();
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  return (
    <YStack
      onTouchCancel={handleTouchCancel}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      testID={testID}
    >
      <YStack alignItems="center" paddingTop="$2">
        <YStack backgroundColor="$borderColor" borderRadius="$10" height={4} width={48} />
      </YStack>
      {children}
    </YStack>
  );
}
