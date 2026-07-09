import { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as ExpoRouter from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { isIosEdgeSwipeBackPath } from '@/components/ui/ios-edge-swipe-back-paths';

const EDGE_WIDTH = 28;
const ACTIVE_TRANSLATION_X = 12;
const DISMISS_TRANSLATION_X = 56;
const DISMISS_VELOCITY_X = 650;
const VERTICAL_FAIL_OFFSET = 24;

type IosEdgeSwipeBackProps = {
  enabled?: boolean;
};

function useOptionalPathname() {
  const readPathname = ExpoRouter.usePathname;

  return typeof readPathname === 'function' ? readPathname() : '/';
}

export function IosEdgeSwipeBack({ enabled }: IosEdgeSwipeBackProps) {
  const router = ExpoRouter.useRouter();
  const pathname = useOptionalPathname();
  const isEnabled = Platform.OS === 'ios' && (enabled ?? isIosEdgeSwipeBackPath(pathname));

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isEnabled)
        .activeOffsetX(ACTIVE_TRANSLATION_X)
        .failOffsetY([-VERTICAL_FAIL_OFFSET, VERTICAL_FAIL_OFFSET])
        .onEnd((event) => {
          if (
            event.translationX >= DISMISS_TRANSLATION_X ||
            event.velocityX >= DISMISS_VELOCITY_X
          ) {
            runOnJS(goBack)();
          }
        }),
    [goBack, isEnabled],
  );

  if (!isEnabled) return null;

  return (
    <GestureDetector gesture={gesture}>
      <View pointerEvents="box-only" style={styles.edgeHitArea} />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  edgeHitArea: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: EDGE_WIDTH,
    zIndex: 1000,
  },
});
