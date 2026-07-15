import '@tamagui/native/setup-keyboard-controller';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/lib/providers/app-providers';
import { IncomingLinkHandler } from '@/components/navigation/incoming-link-handler';
import { OtaUpdateWatcher } from '@/components/ota-update-watcher';
import { CartHydrator } from '@/features/cart/components/cart-hydrator';
import { PhoneVerificationGate } from '@/features/profile/components/phone-verification-gate';
import { loadWebStyles } from '../theme/web-css';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

loadWebStyles();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <OtaUpdateWatcher />
        <CartHydrator />
        <Stack
          screenOptions={{
            fullScreenGestureEnabled: true,
            gestureEnabled: true,
            headerShown: false,
          }}
        />
        <IncomingLinkHandler />
        <PhoneVerificationGate />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
