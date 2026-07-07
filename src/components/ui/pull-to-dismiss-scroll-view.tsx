import type { ScrollViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  getPullDownDistance,
  getPullDownOpacity,
  isScrollAtTop,
  PULL_TO_DISMISS_DISTANCE,
  PULL_TO_DISMISS_EXIT_DISTANCE,
  PULL_TO_DISMISS_EXIT_DURATION_MS,
  shouldDismissOnPullRelease,
} from '@/utils/pull-to-dismiss';

/** Downward drag (px) needed before the pull gesture activates, so taps and horizontal swipes stay untouched. */
const PULL_ACTIVATION_OFFSET = 16;
/** Sideways drag (px) that fails the pull gesture so horizontal carousels inside the content keep paging. */
const PULL_HORIZONTAL_FAIL_OFFSET = 24;
/** Duration of the snap-back animation when the pull is released below the dismiss threshold. */
const PULL_RESET_DURATION_MS = 180;

export type PullToDismissScrollViewProps = Omit<ScrollViewProps, 'onScroll' | 'scrollEventThrottle'> & {
  /** Called when the user pulls down past the threshold while the content is at the top. */
  onDismiss: () => void;
  /**
   * Scroll offset stream for callers that react to the scroll position.
   * Replaces `onScroll` (which the component owns: offsets are tracked on the
   * UI thread and reported as 0 while a pull holds the content pinned).
   */
  onScrollOffsetChange?: (offsetY: number) => void;
  /** Pull distance (px) past which releasing dismisses. Defaults to {@link PULL_TO_DISMISS_DISTANCE}. */
  dismissThreshold?: number;
  /** Set false to keep the scroll view but turn the pull-to-dismiss gesture off. */
  dismissEnabled?: boolean;
};

/**
 * Vertical ScrollView that can be pulled down to close the screen: when the
 * content rests at the top, dragging further down moves the content with the
 * finger while it gently fades; releasing past the threshold (or flinging)
 * continues the slide-and-fade exit and calls `onDismiss`, anything less
 * springs back. Scrolling itself is untouched — the pan runs simultaneously
 * with the scroll gesture and only engages at the top.
 *
 * While a pull is engaged the scroll view is locked to the top on the UI
 * thread (`scrollTo` inside the scroll worklet): scroll views consume drag
 * deltas incrementally, so without the lock every tiny upward finger wobble
 * would scroll the content and yank the translated pull back — visible as
 * jitter on the content. With the lock the pull owns all vertical movement
 * until it collapses back to zero, and only then does scrolling take over.
 *
 * Top-edge overscroll effects (iOS bounce / Android glow) are disabled by
 * default so the pull gesture owns the top edge; override `bounces` /
 * `overScrollMode` only if you also rethink that interaction.
 */
export function PullToDismissScrollView({
  onDismiss,
  onScrollOffsetChange,
  dismissThreshold = PULL_TO_DISMISS_DISTANCE,
  dismissEnabled = true,
  bounces = false,
  overScrollMode = 'never',
  children,
  ...scrollViewProps
}: PullToDismissScrollViewProps) {
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const translateY = useSharedValue(0);
  const pullOpacity = useSharedValue(1);
  const scrollOffsetY = useSharedValue(0);
  const pullStartTranslationY = useSharedValue(0);
  const isDismissing = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    if (translateY.value > 0) {
      // A pull is engaged: revert any scroll a finger wobble produced in the
      // same frame, so the scroll cannot fight the pull translation.
      if (event.contentOffset.y !== 0) {
        scrollTo(animatedRef, 0, 0, false);
      }
      scrollOffsetY.value = 0;
    } else {
      scrollOffsetY.value = event.contentOffset.y;
    }
    if (onScrollOffsetChange) {
      runOnJS(onScrollOffsetChange)(scrollOffsetY.value);
    }
  });

  // The scroll view's native gesture, registered so the pan below can run
  // simultaneously with it instead of stealing its touches.
  const nativeScrollGesture = Gesture.Native();

  const panGesture = Gesture.Pan()
    .enabled(dismissEnabled)
    .activeOffsetY(PULL_ACTIVATION_OFFSET)
    .failOffsetX([-PULL_HORIZONTAL_FAIL_OFFSET, PULL_HORIZONTAL_FAIL_OFFSET])
    .simultaneousWithExternalGesture(nativeScrollGesture)
    .onStart((event) => {
      isDismissing.value = false;
      pullStartTranslationY.value = event.translationY;
    })
    .onUpdate((event) => {
      // Engagement latch: only re-anchor while no pull is engaged. Once the
      // pull holds the content (translateY > 0) the offset is pinned to 0, and
      // the pull must keep following the finger instead of snapping away.
      if (translateY.value === 0 && !isScrollAtTop(scrollOffsetY.value)) {
        // Mid-list drag: keep re-anchoring so the pull only engages (from zero)
        // once the content actually reaches the top within this same drag.
        pullStartTranslationY.value = event.translationY;
        return;
      }
      translateY.value = getPullDownDistance(event.translationY, pullStartTranslationY.value);
      pullOpacity.value = getPullDownOpacity(translateY.value);
    })
    .onEnd((event) => {
      if (shouldDismissOnPullRelease(translateY.value, event.velocityY, dismissThreshold)) {
        // Continue the release's motion — keep sliding down and fade out while
        // the navigator's pop transition runs — so the content never freezes
        // mid-air between the finger letting go and the screen leaving.
        isDismissing.value = true;
        translateY.value = withTiming(translateY.value + PULL_TO_DISMISS_EXIT_DISTANCE, {
          duration: PULL_TO_DISMISS_EXIT_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });
        pullOpacity.value = withTiming(0, { duration: PULL_TO_DISMISS_EXIT_DURATION_MS });
        runOnJS(onDismiss)();
      }
    })
    .onFinalize(() => {
      // Runs on release below the threshold and on gesture cancellation alike,
      // so the content never gets stuck partially pulled down.
      if (!isDismissing.value && translateY.value !== 0) {
        translateY.value = withTiming(0, { duration: PULL_RESET_DURATION_MS });
        pullOpacity.value = withTiming(1, { duration: PULL_RESET_DURATION_MS });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pullOpacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <GestureDetector gesture={nativeScrollGesture}>
          <Animated.ScrollView
            {...scrollViewProps}
            ref={animatedRef}
            bounces={bounces}
            overScrollMode={overScrollMode}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            {children}
          </Animated.ScrollView>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}
