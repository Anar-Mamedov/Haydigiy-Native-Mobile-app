import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, XStack, YStack } from 'tamagui';
import {
  AppScreen,
  EmptyState,
  KeyboardAwareFormScrollView,
  ScreenHeader,
} from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CheckoutCardForm } from '@/features/checkout/components/checkout-card-form';
import { PaymentWebView } from '@/features/checkout/components/payment-webview';
import { OrderMergeCardSession } from '@/types/order-merge.types';
import { formatCurrency } from '@/utils/format-currency';
import { OrderMergePaymentSummary } from '../components/order-merge-payment-summary';
import { useOrderMergePayment } from '../hooks/use-order-merge-payment';
import { parseOrderMergePaymentParams } from '../utils/order-merge-payment-params';

const FOOTER_PADDING = 12;

function OrderMergePaymentContent({ session }: { session: OrderMergeCardSession }) {
  const insets = useSafeAreaInsets();
  const payment = useOrderMergePayment(session);
  const payLabel = payment.isSubmitting
    ? 'İşleniyor...'
    : `${formatCurrency(session.amount)} Öde`;

  return (
    <YStack backgroundColor="$backgroundHover" flex={1}>
      <KeyboardAwareFormScrollView
        contentContainerStyle={{ gap: 12, padding: 12 }}
        testID="order-merge-payment-scroll"
      >
        <OrderMergePaymentSummary session={session} />
        <CheckoutCardForm card={payment.card} />
        {payment.submitError ? (
          <Paragraph color="$red10" fontSize={13} testID="order-merge-payment-error">
            {payment.submitError}
          </Paragraph>
        ) : null}
      </KeyboardAwareFormScrollView>

      <YStack
        backgroundColor="$background"
        borderTopColor="$borderColor"
        borderTopWidth={1}
        padding={FOOTER_PADDING}
        paddingBottom={insets.bottom + FOOTER_PADDING}
      >
        <Button
          accessibilityLabel={payLabel}
          accessibilityRole="button"
          accessibilityState={{ busy: payment.isSubmitting, disabled: !payment.canSubmit }}
          backgroundColor="$brand"
          borderRadius="$4"
          disabled={!payment.canSubmit}
          height={48}
          onPress={payment.submit}
          opacity={payment.canSubmit ? 1 : 0.5}
          pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
        >
          <XStack alignItems="center" gap="$2">
            {payment.isSubmitting ? <Spinner color="white" size="small" /> : null}
            <Paragraph color="white" fontSize={15} fontWeight="700">
              {payLabel}
            </Paragraph>
          </XStack>
        </Button>
      </YStack>

      <PaymentWebView onClose={payment.closeThreeDS} payload={payment.threeDS} />
    </YStack>
  );
}

/**
 * Card step of "Mevcut siparişime ekle": pays only the difference for the products
 * added to the approved order. Opened from the cart with the prepared draft's params.
 */
export function OrderMergePaymentScreen() {
  const router = useRouter();
  const session = parseOrderMergePaymentParams(useLocalSearchParams());

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/cart' as never);
  };

  const header = <ScreenHeader onBack={goBack} title="Güvenli Ödeme" />;

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      {session ? (
        <OrderMergePaymentContent session={session} />
      ) : (
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Sepete Dön"
            description="Ödeme bilgileri bulunamadı. Lütfen sepetinizden tekrar deneyin."
            onActionPress={() => router.replace('/cart' as never)}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      )}
    </AppScreen>
  );
}
