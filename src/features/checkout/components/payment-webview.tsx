import { useRef } from 'react';
import { Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { X } from '@/components/ui/icons';
import { Spinner, useTheme, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ThreeDSPayload } from '../hooks/use-place-order';

interface PaymentWebViewProps {
  payload: ThreeDSPayload | null;
  onClose: () => void;
}

/** Origin the WebView resolves relative URLs against (the web callback chain). */
const WEB_ORIGIN = 'https://haydigiy.com';
const SUCCESS_PATH = '/odeme-basarili';
const FAIL_PATH = '/odeme-basarisiz';

/**
 * Full-screen 3D Secure WebView. Renders the Garanti auto-submit form or İyzico
 * 3DS content, lets the bank → callback chain run, then intercepts the final
 * redirect to the web success/failure page and hands the result to the native
 * success/failure screen. Card data lives only in the rendered HTML — never
 * logged or persisted (AGENTS.md security rule).
 */
export function PaymentWebView({ payload, onClose }: PaymentWebViewProps) {
  const router = useRouter();
  const theme = useTheme();
  const handledRef = useRef(false);

  const handleResult = (url: string): boolean => {
    if (handledRef.current) return false;

    const isSuccess = url.includes(SUCCESS_PATH);
    const isFail = url.includes(FAIL_PATH);
    if (!isSuccess && !isFail) return true;

    handledRef.current = true;
    router.replace({
      pathname: isSuccess ? '/checkout/payment-success' : '/checkout/payment-failed',
      params: { url },
    });
    return false;
  };

  const onShouldStart = (request: WebViewNavigation): boolean => handleResult(request.url);
  const onNavStateChange = (navState: WebViewNavigation) => {
    handleResult(navState.url);
  };

  const close = () => {
    handledRef.current = false;
    onClose();
  };

  const source =
    payload?.kind === 'url'
      ? { uri: payload.url }
      : payload
        ? { html: payload.html, baseUrl: WEB_ORIGIN }
        : null;

  return (
    <Modal
      animationType="slide"
      onRequestClose={close}
      presentationStyle="fullScreen"
      visible={payload !== null}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: theme.background.val }}>
        <XStack
          alignItems="center"
          backgroundColor="$background"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          gap="$3"
          height={52}
          paddingHorizontal="$3"
        >
          <Pressable accessibilityLabel="Ödemeyi iptal et" accessibilityRole="button" hitSlop={8} onPress={close}>
            <X color="$color" size={24} />
          </Pressable>
          <Paragraph color="$color" fontSize={15} fontWeight="700">
            Güvenli Ödeme
          </Paragraph>
        </XStack>

        {source ? (
          <WebView
            key={payload?.kind === 'url' ? payload.url : 'html'}
            incognito
            javaScriptEnabled
            onNavigationStateChange={onNavStateChange}
            onShouldStartLoadWithRequest={onShouldStart}
            originWhitelist={['*']}
            renderLoading={() => (
              <YStack alignItems="center" flex={1} justifyContent="center">
                <Spinner color="$brand" size="large" />
              </YStack>
            )}
            setSupportMultipleWindows={false}
            source={source}
            startInLoadingState
            style={{ flex: 1 }}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
