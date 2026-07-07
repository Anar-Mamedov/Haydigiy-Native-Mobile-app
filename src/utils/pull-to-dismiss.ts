/**
 * Pure gesture math for the pull-to-dismiss interaction: a screen whose
 * scrollable content is at the top can be dragged further down to close it.
 * Functions are worklet-safe so they can run on the UI thread from
 * react-native-gesture-handler callbacks.
 */

/** Pull distance (px) past which releasing the drag dismisses the screen. */
export const PULL_TO_DISMISS_DISTANCE = 140;
/** Minimum pull distance (px) for a fast downward fling to count as a dismiss. */
export const PULL_TO_DISMISS_FLING_MIN_DISTANCE = 56;
/** Downward velocity (px/s) past which a fling dismisses even before the full distance. */
export const PULL_TO_DISMISS_FLING_VELOCITY = 1000;
/** Scroll offsets at or below this (px) count as "scrolled to the top". */
export const PULL_TO_DISMISS_TOP_TOLERANCE = 2;
/** Pull distance (px) over which the content fades from full opacity down to the drag floor. */
export const PULL_TO_DISMISS_FADE_DISTANCE = 700;
/** Lowest opacity the content fades to while still being dragged. */
export const PULL_TO_DISMISS_MIN_DRAG_OPACITY = 0.6;
/** Extra distance (px) the content keeps sliding after a dismissing release. */
export const PULL_TO_DISMISS_EXIT_DISTANCE = 160;
/** Duration of the slide-and-fade exit animation after a dismissing release. */
export const PULL_TO_DISMISS_EXIT_DURATION_MS = 240;

/** Whether the scroll position counts as resting at the very top. */
export function isScrollAtTop(scrollOffsetY: number): boolean {
  'worklet';
  return scrollOffsetY <= PULL_TO_DISMISS_TOP_TOLERANCE;
}

/**
 * Downward pull applied to the screen for the current drag. The anchor is the
 * pan translation recorded when the pull engaged (gesture start, or the moment
 * the content reached the top mid-drag), so the screen never jumps.
 */
export function getPullDownDistance(translationY: number, pullStartTranslationY: number): number {
  'worklet';
  return Math.max(0, translationY - pullStartTranslationY);
}

/**
 * Content opacity for the current pull: full at rest, fading gently as the
 * pull grows so the user senses the screen letting go, never below the drag
 * floor while the finger is still down (the exit animation takes it to 0).
 */
export function getPullDownOpacity(pullDistance: number): number {
  'worklet';
  const faded = 1 - pullDistance / PULL_TO_DISMISS_FADE_DISTANCE;
  return Math.max(PULL_TO_DISMISS_MIN_DRAG_OPACITY, Math.min(1, faded));
}

/** Whether releasing the drag should dismiss: pulled far enough, or flung down fast. */
export function shouldDismissOnPullRelease(
  pullDistance: number,
  velocityY: number,
  dismissDistance: number = PULL_TO_DISMISS_DISTANCE,
): boolean {
  'worklet';
  if (pullDistance >= dismissDistance) return true;
  return pullDistance >= PULL_TO_DISMISS_FLING_MIN_DISTANCE && velocityY >= PULL_TO_DISMISS_FLING_VELOCITY;
}
