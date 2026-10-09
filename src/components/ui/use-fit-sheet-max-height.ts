import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Share of the window a fitted sheet may cover at most. */
const FIT_SHEET_MAX_HEIGHT_RATIO = 0.92;
/** Gap kept between the sheet top and the status bar / Dynamic Island. */
const FIT_SHEET_TOP_GAP = 12;

/** Pure max-height calculation for `snapPointsMode="fit"` sheets. */
export function getFitSheetMaxHeight(windowHeight: number, topInset: number): number {
  return Math.round(
    Math.min(windowHeight * FIT_SHEET_MAX_HEIGHT_RATIO, windowHeight - topInset - FIT_SHEET_TOP_GAP),
  );
}

/**
 * Absolute max height for a `snapPointsMode="fit"` `Sheet.Frame`.
 *
 * A percent `maxHeight` (e.g. "92%") is ignored in fit mode because the frame's parent has no
 * fixed height. Tall content then grows the frame up to the full window, the sheet snaps to the
 * top of the screen and its header (title + close control) ends up under the iOS status bar.
 */
export function useFitSheetMaxHeight(): number {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return getFitSheetMaxHeight(height, insets.top);
}
