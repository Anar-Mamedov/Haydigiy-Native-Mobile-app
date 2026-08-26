import { useRouter } from 'expo-router';
import { CheckCircle } from '@/components/ui/icons';
import { Button, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppScreen, ScreenHeader, SectionCard } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { usePaymentSuccess } from '../hooks/use-payment-success';
import { InsiderRecommendationSection } from '@/features/insider/components/insider-recommendation-section';

export function PaymentSuccessScreen() {
  const router = useRouter();
  const { orderDetails, isProcessing } = usePaymentSuccess();
  const header = <ScreenHeader onBack={() => router.replace('/')} title="Güvenli Ödeme" />;

  if (isProcessing) {
    return (
      <AppScreen header={header} scrollable={false}>
        <YStack alignItems="center" flex={1} gap="$3" justifyContent="center">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10" fontSize={14}>
            Ödemeniz doğrulanıyor...
          </Paragraph>
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor="$backgroundHover" header={header}>
      <YStack alignItems="center" flex={1} justifyContent="center" paddingVertical="$6">
        <SectionCard alignItems="center" gap="$4" maxWidth={420} padding="$5" width="100%">
          <CheckCircle color="$green10" size={72} />
          <Paragraph color="$color" fontSize={22} fontWeight="800" textAlign="center">
            Siparişiniz Başarıyla Oluşturuldu!
          </Paragraph>
          <Paragraph color="$color10" fontSize={14} textAlign="center">
            Siparişiniz başarıyla alındı ve işleme konuldu. &quot;Siparişlerim&quot; sayfasından takip
            edebilirsiniz.
          </Paragraph>

          {orderDetails ? (
            <YStack
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              gap="$2"
              padding="$3.5"
              width="100%"
            >
              {orderDetails.orderNo ? (
                <XStack justifyContent="space-between">
                  <Paragraph color="$color10" fontSize={13}>
                    Sipariş Numarası
                  </Paragraph>
                  <Paragraph color="$color" fontSize={13} fontWeight="700">
                    {orderDetails.orderNo}
                  </Paragraph>
                </XStack>
              ) : null}
              {orderDetails.totalPrice > 0 ? (
                <XStack justifyContent="space-between">
                  <Paragraph color="$color10" fontSize={13}>
                    Toplam Tutar
                  </Paragraph>
                  <Paragraph color="$color" fontSize={13} fontWeight="700">
                    {formatCurrency(orderDetails.totalPrice)}
                  </Paragraph>
                </XStack>
              ) : null}
            </YStack>
          ) : null}

          <YStack gap="$2.5" width="100%">
            <Button
              accessibilityLabel="Siparişlerime git"
              backgroundColor="$brand"
              borderRadius="$4"
              height={48}
              onPress={() => router.replace('/orders')}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="white" fontSize={15} fontWeight="700">
                Siparişlerime Git
              </Paragraph>
            </Button>
            <Button
              accessibilityLabel="Alışverişe devam et"
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              height={48}
              onPress={() => router.replace('/')}
              pressStyle={{ opacity: 0.7 }}
            >
              <Paragraph color="$color" fontSize={15} fontWeight="700">
                Alışverişe Devam Et
              </Paragraph>
            </Button>
          </YStack>
        </SectionCard>

        <InsiderRecommendationSection slot="orderSuccess" />
      </YStack>
    </AppScreen>
  );
}
