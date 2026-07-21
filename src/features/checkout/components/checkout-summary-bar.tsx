import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, Separator, Spinner, XStack, YStack } from 'tamagui';
import type { OrderTokenSummary } from '@/types/checkout.types';
import { formatCurrency } from '@/utils/format-currency';

export interface CheckoutSummaryBarProps {
  summary: OrderTokenSummary | null;
  isSummaryLoading: boolean;
  expanded: boolean;
  onToggle: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  hint: string | null;
  onSubmit: () => void;
  agreementSlot?: ReactNode;
  reserveBottomSafeArea?: boolean;
}

function Row({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'discount' | 'total';
}) {
  const valueColor = tone === 'discount' ? '$green10' : tone === 'total' ? '$brand' : '$color11';
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Paragraph color="$color10" fontSize={13} fontWeight={tone === 'total' ? '700' : '400'}>
        {label}
      </Paragraph>
      <Paragraph color={valueColor} fontSize={13} fontWeight={tone === 'total' ? '800' : '600'}>
        {value}
      </Paragraph>
    </XStack>
  );
}

export function CheckoutSummaryBar(props: CheckoutSummaryBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = props.reserveBottomSafeArea === false ? 0 : insets.bottom;
  const summary = props.summary;
  const isFreeShipping = summary?.cargoPrice === 0;
  const totalLabel = summary ? formatCurrency(summary.totalPrice) : '—';

  return (
    <YStack
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      paddingBottom={bottomPadding}
      position="relative"
      testID="checkout-summary-bar"
      width="100%"
      zIndex={2}
    >
      {props.expanded ? (
        <YStack
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          gap="$1.5"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Row label="Ara Toplam" value={summary ? formatCurrency(summary.subtotal) : '—'} />
          {summary && summary.userDiscount > 0 ? (
            <Row
              label="İndirim"
              tone="discount"
              value={`- ${formatCurrency(summary.userDiscount)}`}
            />
          ) : null}
          {summary && summary.campaignDiscount > 0 ? (
            <Row
              label="Kampanya İndirimi"
              tone="discount"
              value={`- ${formatCurrency(summary.campaignDiscount)}`}
            />
          ) : null}
          {summary && (summary.couponDiscount > 0 || summary.isFreeShippingCoupon) ? (
            <Row
              label="Kupon İndirimi"
              tone="discount"
              value={
                summary.couponDiscount > 0
                  ? `- ${formatCurrency(summary.couponDiscount)}`
                  : 'Uygulandı'
              }
            />
          ) : null}
          {summary && summary.commission > 0 ? (
            <Row
              label={`Komisyon (%${summary.commissionRate})`}
              value={formatCurrency(summary.commission)}
            />
          ) : null}
          {summary && summary.serviceFee > 0 ? (
            <Row label="Hizmet Bedeli" value={formatCurrency(summary.serviceFee)} />
          ) : null}
          <Row
            label="Kargo"
            tone={isFreeShipping ? 'discount' : 'default'}
            value={
              summary ? (isFreeShipping ? 'Ücretsiz' : formatCurrency(summary.cargoPrice)) : '—'
            }
          />
          {summary && summary.installmentFee > 0 ? (
            <Row
              label={`Vade Farkı (${summary.installmentCount} Taksit)`}
              value={formatCurrency(summary.installmentFee)}
            />
          ) : null}
          <Separator borderColor="$borderColor" marginVertical="$1" />
          <Row label="Genel Toplam" tone="total" value={totalLabel} />
          {props.isSummaryLoading ? (
            <Paragraph accessibilityLiveRegion="polite" color="$color10" fontSize={11}>
              Sipariş tutarları güncelleniyor...
            </Paragraph>
          ) : null}
        </YStack>
      ) : null}

      {props.agreementSlot ? (
        <YStack paddingHorizontal="$3" paddingTop="$3">
          {props.agreementSlot}
        </YStack>
      ) : null}

      {props.submitError ? (
        <XStack
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          accessible
          backgroundColor="$red2"
          borderColor="$red7"
          borderRadius="$3"
          borderWidth={1}
          margin="$3"
          marginBottom={0}
          padding="$2.5"
        >
          <Paragraph color="$red10" fontSize={12}>
            {props.submitError}
          </Paragraph>
        </XStack>
      ) : null}

      <YStack gap="$1.5" padding="$3">
        <XStack
          alignItems="center"
          gap="$3"
          justifyContent="space-between"
          testID="checkout-summary-actions"
        >
          <XStack alignItems="center" flex={1} gap="$2">
            <Pressable
              accessibilityLabel={props.expanded ? 'Özeti gizle' : 'Özeti göster'}
              accessibilityRole="button"
              hitSlop={8}
              onPress={props.onToggle}
            >
              {props.expanded ? (
                <ChevronDown color="$brand" size={22} />
              ) : (
                <ChevronUp color="$brand" size={22} />
              )}
            </Pressable>
            <YStack>
              <Paragraph color="$color10" fontSize={11}>
                Toplam
              </Paragraph>
              <Paragraph color="$color" fontSize={17} fontWeight="800" numberOfLines={1}>
                {totalLabel}
              </Paragraph>
            </YStack>
          </XStack>

          <Button
            accessibilityLabel="Onayla ve bitir"
            accessibilityRole="button"
            backgroundColor="$brand"
            borderRadius="$4"
            disabled={!props.canSubmit || props.isSubmitting}
            height={46}
            onPress={props.onSubmit}
            opacity={!props.canSubmit || props.isSubmitting ? 0.5 : 1}
            paddingHorizontal="$5"
            pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
          >
            <XStack alignItems="center" gap="$2">
              {props.isSubmitting ? <Spinner color="white" size="small" /> : null}
              <Paragraph color="white" fontSize={14} fontWeight="700">
                {props.isSubmitting ? 'İşleniyor...' : 'Onayla ve Bitir'}
              </Paragraph>
            </XStack>
          </Button>
        </XStack>

        {props.hint ? (
          <Paragraph
            alignSelf="flex-end"
            color="$orange10"
            fontSize={11}
            textAlign="right"
            testID="checkout-summary-hint"
          >
            {props.hint}
          </Paragraph>
        ) : null}
      </YStack>
    </YStack>
  );
}
