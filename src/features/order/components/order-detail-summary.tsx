import { Linking } from 'react-native';
import { FileText, Truck } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { OrderDetail } from '@/types/order.types';

type OrderDetailSummaryProps = {
  order: OrderDetail;
};

const DELIVERED_STATUSES = ['Teslim Edildi', 'Sipariş tamamlandı'];

export function OrderDetailSummary({ order }: OrderDetailSummaryProps) {
  const statusColor = order.statusColor || BRAND_COLOR;
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

        {order.trackingCode && order.statusId !== 4 ? (
          <XStack
            alignItems="center"
            borderTopColor="$borderColor"
            borderTopWidth={1}
            gap="$2"
            justifyContent="space-between"
            paddingTop="$3"
          >
            <XStack alignItems="center" flex={1} gap="$2">
              <Truck color="$brand" size={16} />
              <Paragraph color="$color10" flex={1} fontSize={12} numberOfLines={1}>
                Takip:{' '}
                <Paragraph color="$blue10" fontSize={12} fontWeight="700">
                  {order.trackingCode}
                </Paragraph>
              </Paragraph>
            </XStack>
            {order.cargoCompanyName ? (
              <Paragraph color="$color10" fontSize={12}>
                {order.cargoCompanyName}
              </Paragraph>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
