import { usePathname } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { YStack } from 'tamagui';
import { useAppUpdate } from '../context/app-update-context';
import { shouldDismissHomeBanner } from '../utils/home-banner-swipe';
import { AppUpdateBanner } from './app-update-banner';

const SWIPE_EXIT_DURATION_MS = 180;
const SWIPE_ACTIVATION_OFFSET = 12;
const SWIPE_VERTICAL_FAIL_OFFSET = 14;

function normalizePathname(pathname: string): string {
  return pathname.replace(/^\/\(tabs\)/, '') || '/';
}

export function HomeAppUpdateBanner() {
  const pathname = normalizePathname(usePathname());
  const { width: viewportWidth } = useWindowDimensions();
  const {
    dismissHomeBanner,
    errorMessage,
    installedVersionLabel,
    isHomeBannerVisible,
    isOpeningStore,
    openStore,
  } = useAppUpdate();
  const translateX = useSharedValue(0);
  const isDismissing = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-SWIPE_ACTIVATION_OFFSET, SWIPE_ACTIVATION_OFFSET])
    .failOffsetY([-SWIPE_VERTICAL_FAIL_OFFSET, SWIPE_VERTICAL_FAIL_OFFSET])
    .onUpdate((event) => {
      if (!isDismissing.value) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (shouldDismissHomeBanner(event.translationX, event.velocityX, viewportWidth)) {
        isDismissing.value = true;
        const direction = event.translationX < 0 || event.velocityX < 0 ? -1 : 1;
        translateX.value = withTiming(
          direction * (viewportWidth + 32),
          {
            duration: SWIPE_EXIT_DURATION_MS,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(dismissHomeBanner)();
            }
          },
        );
      }
    })
    .onFinalize(() => {
      if (!isDismissing.value) {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, viewportWidth * 0.75],
      [1, 0.35],
      'clamp',
    ),
    transform: [{ translateX: translateX.value }],
  }));

  if (pathname !== '/' || !isHomeBannerVisible) {
    return null;
  }

  return (
    <YStack backgroundColor="$background" overflow="hidden" paddingHorizontal="$3" paddingVertical="$2">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          accessibilityHint="Gizlemek için sağa veya sola kaydırın"
          accessibilityLabel="Yeni uygulama sürümü bildirimi"
          style={animatedStyle}
        >
          <AppUpdateBanner
            errorMessage={errorMessage}
            installedVersionLabel={installedVersionLabel}
            isOpeningStore={isOpeningStore}
            onUpdatePress={openStore}
          />
        </Animated.View>
      </GestureDetector>
    </YStack>
  );
}
