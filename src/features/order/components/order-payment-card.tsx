import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { OrderTotalsView } from '@/types/order.types';
import { formatOrderPrice } from '../utils/order-status';

function Row({
  label,
  value,
  discount,
}: {
  label: string;
  value: string;
  discount?: boolean;
}) {
  return (
    <XStack justifyContent="space-between">
      <Paragraph color="$color10" fontSize={13}>
        {label}
      </Paragraph>
      <Paragraph color={discount ? '$green10' : '$color'} fontSize={13} fontWeight="500">
        {value}
      </Paragraph>
    </XStack>
  );
}

type OrderPaymentCardProps = {
  totals: OrderTotalsView;
};

/** "Ödeme Bilgileri" totals breakdown, mirroring the web order detail. */
export function OrderPaymentCard({ totals }: OrderPaymentCardProps) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={15} fontWeight="700">
          Ödeme Bilgileri
        </Paragraph>

        <YStack gap="$2.5">
          <Row label="Ürün Toplamı:" value={formatOrderPrice(totals.subtotal)} />
          {totals.userDiscount > 0 ? (
            <Row discount label="Müşteri İndirimi:" value={`-${formatOrderPrice(totals.userDiscount)}`} />
          ) : null}
          {totals.couponDiscount > 0 ? (
            <Row
              discount
              label={`Kupon İndirimi${totals.couponCode ? ` (${totals.couponCode})` : ''}:`}
              value={`-${formatOrderPrice(totals.couponDiscount)}`}
            />
          ) : null}
          {totals.campaignDiscount > 0 ? (
            <Row
              discount
              label="Kampanya İndirimi:"
              value={`-${formatOrderPrice(totals.campaignDiscount)}`}
            />
          ) : null}
          <Row label="Kargo Hizmet Bedeli:" value={formatOrderPrice(totals.cargoFee)} />
          {totals.codFee > 0 ? (
            <Row label="Kapıda Ödeme Hizmet Ücreti:" value={formatOrderPrice(totals.codFee)} />
          ) : null}
          {totals.paymentFee > 0 ? (
            <Row label="Ödeme Ücreti:" value={formatOrderPrice(totals.paymentFee)} />
          ) : null}
          {totals.hasInstallmentInfo ? (
            <>
              {totals.installmentCount ? (
                <Row label="Taksit Sayısı:" value={`${totals.installmentCount} Taksit`} />
              ) : null}
              <Row label="Peşin Toplam:" value={formatOrderPrice(totals.total)} />
              {totals.interestAmount > 0 ? (
                <Row label="Vade Farkı:" value={formatOrderPrice(totals.interestAmount)} />
              ) : null}
              {totals.totalWithInterest > 0 && totals.totalWithInterest !== totals.total ? (
                <Row label="Taksitli Toplam:" value={formatOrderPrice(totals.totalWithInterest)} />
              ) : null}
            </>
          ) : null}
          {totals.returnTotal > 0 ? (
            <Row label="İade Toplamı:" value={formatOrderPrice(totals.returnTotal)} />
          ) : null}

          <XStack
            borderTopColor="$borderColor"
            borderTopWidth={1}
            justifyContent="space-between"
            paddingTop="$3"
          >
            <Paragraph color="$color" fontSize={15} fontWeight="700">
              Toplam:
            </Paragraph>
            <Paragraph color="$brand" fontSize={18} fontWeight="800">
              {formatOrderPrice(totals.payableTotal)}
            </Paragraph>
          </XStack>

          {totals.paymentMethod ? (
            <XStack justifyContent="center" paddingTop="$1">
              <XStack
                backgroundColor="$backgroundHover"
                borderRadius={100}
                paddingHorizontal="$3"
                paddingVertical="$1.5"
              >
                <Paragraph color="$color10" fontSize={13}>
                  {totals.paymentMethod}
                </Paragraph>
              </XStack>
            </XStack>
          ) : null}
        </YStack>
      </YStack>
    </SectionCard>
  );
}
