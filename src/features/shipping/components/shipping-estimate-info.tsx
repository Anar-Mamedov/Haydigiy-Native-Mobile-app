import { Image } from 'expo-image';
import { Package } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { ShippingEstimate } from '@/types/shipping.types';

type ShippingEstimateInfoVariant = 'product' | 'cart';

type ShippingEstimateInfoProps = {
  estimate: ShippingEstimate | null | undefined;
  /** `cart` (default) renders slightly larger; `product` matches the product detail box. */
  variant?: ShippingEstimateInfoVariant;
};

/**
 * Mirrors the web `ShippingEstimateInfo`: top line shows the dispatch
 * ("kargoya teslim") sentence; when an estimated delivery day is available a
 * second row highlights it, plus any holiday/deadline warning.
 *
 * The estimate is always supplied by the caller from the `/shipping-estimate`
 * API (`useShippingEstimateQuery`); a missing estimate renders the "Yükleniyor..."
 * placeholder rather than any static fallback text.
 */
export function ShippingEstimateInfo({ estimate, variant = 'cart' }: ShippingEstimateInfoProps) {
  const warning = estimate?.deliveryWarning;
  const hasWarning = Boolean(warning?.show);
  const deliveryDay = estimate?.estimatedDeliveryDayHuman?.trim() || null;
  const dispatchText = estimate?.message?.replace(/\.$/, '') || 'Yükleniyor...';
  const teslimLabel =
    hasWarning && warning?.type === 'holiday_period'
      ? 'Tahmini teslimat (bayram sonrası)'
      : 'Tahmini Teslim';

  const fontSize = variant === 'cart' ? 13 : 12.5;
  const padding = variant === 'cart' ? '$3' : '$2.5';

  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap={deliveryDay ? '$2.5' : 0}
      padding={padding}
      width="100%"
    >
      <XStack alignItems="center" gap="$2">
        <Package color="$color10" size={16} />
        <Paragraph color="$color10" flex={1} fontSize={fontSize} lineHeight={18}>
          Tahmini Kargoya Teslim:{' '}
          <Paragraph color="$color" fontSize={fontSize} fontWeight="700">
            {dispatchText}
          </Paragraph>
        </Paragraph>
      </XStack>

      {deliveryDay ? (
        <>
          <YStack borderTopColor="$borderColor" borderTopWidth={1} />
          <XStack alignItems="flex-start" gap="$2.5">
            <XStack
              alignItems="center"
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$3"
              borderWidth={1}
              height={44}
              justifyContent="center"
              width={44}
            >
              <Image
                contentFit="contain"
                source={require('../../../../assets/images/green-fast-delivery.svg')}
                style={{ width: 28, height: 14 }}
              />
            </XStack>
            <YStack flex={1} gap="$1">
              <Paragraph color="$color" fontSize={fontSize} lineHeight={18}>
                <Paragraph color="$color" fontSize={fontSize} fontWeight="700">
                  {teslimLabel}:{' '}
                </Paragraph>
                <Paragraph color="$color" fontSize={fontSize} fontWeight="800">
                  {deliveryDay} kapında!
                </Paragraph>
              </Paragraph>
              {hasWarning && warning?.message ? (
                <Paragraph color="$yellow11" fontSize={fontSize - 1} lineHeight={16}>
                  {warning.message}
                </Paragraph>
              ) : null}
            </YStack>
          </XStack>
        </>
      ) : null}
    </YStack>
  );
}
