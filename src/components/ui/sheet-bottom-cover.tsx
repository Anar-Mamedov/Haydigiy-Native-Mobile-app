import { YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Tab bar height a fitted sheet would otherwise leave uncovered at the bottom. */
const BOTTOM_TAB_BAR_COVER_HEIGHT = 64;

type SheetBottomCoverProps = {
  testID?: string;
};

/**
 * Fills the strip underneath a `snapPointsMode="fit"` sheet frame with the themed
 * sheet background, so the tab bar / home indicator area never shows through while
 * the sheet is moved up and down by the keyboard.
 *
 * The owning `Sheet.Frame` must set `overflow="visible"` for the cover to be drawn.
 */
export function SheetBottomCover({ testID }: SheetBottomCoverProps) {
  const insets = useSafeAreaInsets();
  const height = BOTTOM_TAB_BAR_COVER_HEIGHT + insets.bottom;

  return (
    <YStack
      backgroundColor="$background"
      bottom={-height}
      height={height}
      left={0}
      pointerEvents="none"
      position="absolute"
      right={0}
      testID={testID}
    />
  );
}
