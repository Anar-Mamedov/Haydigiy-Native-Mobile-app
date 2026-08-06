import '@tamagui/native/setup-keyboard-controller';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '@/lib/providers/app-providers';
import { IncomingLinkHandler } from '@/components/navigation/incoming-link-handler';
import { InsiderIntegration } from '@/features/insider/components/insider-integration';
import { OtaUpdateWatcher } from '@/components/ota-update-watcher';
import { AppUpdateProvider } from '@/features/app-update/components/app-update-provider';
import { CartHydrator } from '@/features/cart/components/cart-hydrator';
import { CookieConsentGate } from '@/features/consent/components/cookie-consent-gate';
import { NotificationPermissionRequest } from '@/features/notifications/components/notification-permission-request';
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
        <AppUpdateProvider>
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
          <InsiderIntegration />
          {/* KVKK aydınlatması diğer istemlerin önünde cevaplanmalı. */}
          <CookieConsentGate />
          {/* Mounted after Insider so the SDK is registered before we prompt. */}
          <NotificationPermissionRequest />
          <PhoneVerificationGate />
        </AppUpdateProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
