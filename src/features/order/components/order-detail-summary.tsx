import { Linking } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, FileText, Truck } from '@/components/ui/icons';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { OrderDetail } from '@/types/order.types';
import { CARGO_TRACKING_PENDING_MESSAGE, getCustomerTrackingCode } from '../utils/cargo-tracking';

type OrderDetailSummaryProps = {
  order: OrderDetail;
  onPressCargoTracking?: () => void;
};

const DELIVERED_STATUSES = ['Teslim Edildi', 'Sipariş tamamlandı'];

export function OrderDetailSummary({ order, onPressCargoTracking }: OrderDetailSummaryProps) {
  const statusColor = order.statusColor || BRAND_COLOR;
  // Aras Kargo'da gerçek takip numarası üretilene kadar alanda siparişin kendi numarası duruyor.
  const customerTrackingCode = getCustomerTrackingCode({
    cargoCompanyName: order.cargoCompanyName,
    orderNo: order.orderNo,
    trackingCode: order.trackingCode,
  });
  const isDelivered =
    DELIVERED_STATUSES.includes(order.status) || order.statusId === 8;

  const summaryParts: string[] = [];
  if (order.totalItemsQty > 0) summaryParts.push(`Paketinizde ${order.totalItemsQty} ürün`);
  if (order.returnedQty > 0) summaryParts.push(`${order.returnedQty} iade`);
  if (order.cancelledQty > 0) summaryParts.push(`${order.cancelledQty} iptal`);

  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <XStack gap="$3" justifyContent="space-between">
          <YStack flex={1} gap="$1">
            <Paragraph color="$color" fontSize={16} fontWeight="700">
              Sipariş #{order.orderNo}
            </Paragraph>
            <Paragraph color="$color10" fontSize={13}>
              Sipariş Tarihi: {order.createdAt}
            </Paragraph>
            {isDelivered && order.deliveredAt ? (
              <Paragraph color="$color10" fontSize={13}>
                Teslim Tarihi: {order.deliveredAt}
              </Paragraph>
            ) : null}
          </YStack>

          <YStack alignItems="flex-end" gap="$2">
            <XStack
              backgroundColor={`${statusColor}20` as never}
              borderRadius={100}
              paddingHorizontal="$3"
              paddingVertical="$1"
            >
              <Paragraph color={statusColor as never} fontSize={12} fontWeight="600">
                {order.status}
              </Paragraph>
            </XStack>
            {order.invoicePdfUrl ? (
              <Button
                accessibilityLabel="Faturayı görüntüle"
                backgroundColor="$brand"
                borderRadius="$3"
                height={30}
                onPress={() => Linking.openURL(order.invoicePdfUrl as string).catch(() => undefined)}
                paddingHorizontal="$3"
                pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
              >
                <XStack alignItems="center" gap="$1.5">
                  <FileText color="white" size={14} />
                  <Paragraph color="white" fontSize={12} fontWeight="700">
                    Fatura
                  </Paragraph>
                </XStack>
              </Button>
            ) : null}
          </YStack>
        </XStack>

        <Paragraph color="$color" fontSize={13}>
          <Paragraph color="$color10" fontSize={13}>
            Sipariş Özeti:{' '}
          </Paragraph>
          {order.isFullyCancelled ? (
            <Paragraph color="$red10" fontSize={13} fontWeight="600">
              Siparişiniz iptal edildi
            </Paragraph>
          ) : (
            <Paragraph color="$color" fontSize={13} fontWeight="600">
              {summaryParts.length > 0 ? summaryParts.join(' · ') : 'Sipariş bilgisi yok'}
            </Paragraph>
          )}
        </Paragraph>

        {(order.cargoCompanyName || order.trackingCode) && order.statusId !== 4 ? (
          <XStack
            alignItems="center"
            borderTopColor="$borderColor"
            borderTopWidth={1}
            gap="$3"
            justifyContent="space-between"
            paddingTop="$3"
          >
            <XStack alignItems="center" flex={1} gap="$2" minWidth={0}>
              {order.cargoCompanyLogo ? (
                <Image
                  accessibilityLabel={order.cargoCompanyName ?? 'Kargo'}
                  contentFit="contain"
                  source={{ uri: order.cargoCompanyLogo }}
                  style={{ width: 54, height: 22 }}
                />
              ) : (
                <Truck color="$brand" size={17} />
              )}
              <YStack flex={1} gap="$0.5" minWidth={0}>
                {order.cargoCompanyName ? (
                  <XStack alignItems="center" gap="$1" minWidth={0}>
                    <Paragraph color="$color10" fontSize={12}>
                      Kargo Firması:
                    </Paragraph>
                    <Paragraph
                      color="$color"
                      flex={1}
                      fontSize={12}
                      fontWeight="700"
                      numberOfLines={1}
                    >
                      {order.cargoCompanyName}
                    </Paragraph>
                  </XStack>
                ) : null}
                {customerTrackingCode ? (
                  <Paragraph color="$color10" fontSize={12} numberOfLines={1}>
                    Takip:{' '}
                    <Paragraph color="$blue10" fontSize={12} fontWeight="700">
                      {customerTrackingCode}
                    </Paragraph>
                  </Paragraph>
                ) : (
                  <Paragraph color="$color10" fontSize={12}>
                    {CARGO_TRACKING_PENDING_MESSAGE}
                  </Paragraph>
                )}
              </YStack>
            </XStack>
            {customerTrackingCode && onPressCargoTracking ? (
              <Button
                accessibilityLabel="Kargo Takip"
                backgroundColor="$brand"
                borderRadius="$4"
                height={34}
                onPress={onPressCargoTracking}
                paddingHorizontal="$3"
                pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
              >
                <XStack alignItems="center" gap="$1">
                  <Truck color="white" size={14} />
                  <Paragraph color="white" fontSize={12} fontWeight="800" numberOfLines={1}>
                    Kargo Takip
                  </Paragraph>
                  <ChevronRight color="white" size={13} />
                </XStack>
              </Button>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
