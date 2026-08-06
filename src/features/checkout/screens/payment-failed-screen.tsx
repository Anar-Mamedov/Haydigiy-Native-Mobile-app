import { useRouter, useLocalSearchParams } from 'expo-router';
import { Hourglass, XCircle } from '@/components/ui/icons';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppScreen, ScreenHeader, SectionCard } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { parseQuery } from '../utils/parse-query';
import { parsePrice } from '../utils/parse-price';

const DEFAULT_MESSAGE =
  'Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyiniz veya farklı bir ödeme yöntemi kullanınız.';

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function PaymentFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string; message?: string; status?: string }>();
  const header = <ScreenHeader onBack={() => router.replace('/')} title="Güvenli Ödeme" />;

  const query = parseQuery(firstValue(params.url));
  const pick = (...keys: string[]): string => {
    for (const key of keys) {
      if (query[key] && query[key].trim() !== '') return query[key];
    }
    return '';
  };

  const status = pick('status', 'paymentStatus') || firstValue(params.status);
  const isPending = status === 'pending';
  const message =
    pick('message', 'errorMessage', 'error_message') || firstValue(params.message) || DEFAULT_MESSAGE;
  const orderNo = pick('order_no', 'orderid', 'oid');
  const totalPrice = parsePrice(pick('total_price'));

  if (isPending) {
    return (
      <AppScreen backgroundColor="$backgroundHover" header={header}>
        <YStack alignItems="center" flex={1} justifyContent="center" paddingVertical="$6">
          <SectionCard alignItems="center" gap="$4" maxWidth={420} padding="$5" width="100%">
            <Hourglass color="$orange10" size={68} />
            <Paragraph color="$color" fontSize={21} fontWeight="800" textAlign="center">
              Ödemeniz Kontrol Ediliyor
            </Paragraph>
            <Paragraph color="$color10" fontSize={14} textAlign="center">
              Ödemeniz banka tarafından kontrol edilmektedir. Onaylandığında SMS ile bilgilendirileceksiniz
              ve siparişiniz onaylanacaktır.
            </Paragraph>
            {orderNo || totalPrice > 0 ? (
              <YStack
                backgroundColor="$background"
                borderColor="$borderColor"
                borderRadius="$4"
                borderWidth={1}
                gap="$2"
                padding="$3.5"
                width="100%"
              >
                {orderNo ? (
                  <XStack justifyContent="space-between">
                    <Paragraph color="$color10" fontSize={13}>
                      Sipariş Numarası
                    </Paragraph>
                    <Paragraph color="$color" fontSize={13} fontWeight="700">
                      {orderNo}
                    </Paragraph>
                  </XStack>
                ) : null}
                {totalPrice > 0 ? (
                  <XStack justifyContent="space-between">
                    <Paragraph color="$color10" fontSize={13}>
                      Toplam Tutar
                    </Paragraph>
                    <Paragraph color="$color" fontSize={13} fontWeight="700">
                      {formatCurrency(totalPrice)}
                    </Paragraph>
                  </XStack>
                ) : null}
              </YStack>
            ) : null}
            <YStack gap="$2.5" width="100%">
              <Button
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
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor="$backgroundHover" header={header}>
      <YStack alignItems="center" flex={1} justifyContent="center" paddingVertical="$6">
        <SectionCard alignItems="center" gap="$4" maxWidth={420} padding="$5" width="100%">
          <XCircle color="$red10" size={72} />
          <Paragraph color="$color" fontSize={22} fontWeight="800" textAlign="center">
            Ödemeniz Başarısız Oldu
          </Paragraph>
          <Paragraph color="$color10" fontSize={14} textAlign="center">
            {message}
          </Paragraph>
          <YStack gap="$2.5" width="100%">
            <Button
              backgroundColor="$brand"
              borderRadius="$4"
              height={48}
              onPress={() => router.replace('/')}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="white" fontSize={15} fontWeight="700">
                Alışverişe Devam Et
              </Paragraph>
            </Button>
            <Button
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              height={48}
              onPress={() => router.replace('/cart')}
              pressStyle={{ opacity: 0.7 }}
            >
              <Paragraph color="$color" fontSize={15} fontWeight="700">
                Sepetime Git
              </Paragraph>
            </Button>
          </YStack>
        </SectionCard>
      </YStack>
    </AppScreen>
  );
}
