import { LinearGradient } from 'expo-linear-gradient';
import { Paragraph, Separator, Spinner, YStack } from 'tamagui';
import { CheckoutSection } from './checkout-section';
import { CheckoutOptionRow } from './checkout-option-row';
import { formatCurrency } from '@/utils/format-currency';
import { BRAND_GRADIENT, PAYMENT_DESCRIPTION_BADGE_COLOR } from '@/lib/theme/colors';
import { PaymentMethod } from '@/types/checkout.types';

interface CheckoutPaymentOptionsProps {
  methods: PaymentMethod[];
  selectedSlug: string;
  onSelect: (method: PaymentMethod) => void;
  /** Single-payment total used for the per-method max-order cap check. */
  orderTotal: number;
  isLoading: boolean;
}

/** True when the order (incl. fee/commission) exceeds the method's max-order cap. */
export function isMethodOverLimit(method: PaymentMethod, orderTotal: number): boolean {
  if (method.maxOrderTotal == null) return false;
  const base = orderTotal + (method.serviceFee || 0);
  const commission = method.commissionRate > 0 ? (base * method.commissionRate) / 100 : 0;
  return base + commission > method.maxOrderTotal;
}

export function CheckoutPaymentOptions({
  methods,
  selectedSlug,
  onSelect,
  orderTotal,
  isLoading,
}: CheckoutPaymentOptionsProps) {
  return (
    <CheckoutSection noBodyPadding title="Ödeme Seçenekleri">
      {isLoading ? (
        <YStack alignItems="center" paddingVertical="$5">
          <Spinner color="$brand" />
        </YStack>
      ) : methods.length === 0 ? (
        <Paragraph color="$color10" fontSize={13} paddingVertical="$5" textAlign="center">
          Uygun ödeme seçeneği bulunamadı.
        </Paragraph>
      ) : (
        methods.map((method, index) => {
          const blocked = isMethodOverLimit(method, orderTotal);
          return (
            <YStack key={method.id}>
              {index > 0 ? <Separator borderColor="$borderColor" /> : null}
              <CheckoutOptionRow
                accessibilityLabel={method.name}
                disabled={blocked}
                onPress={() => onSelect(method)}
                paddingVertical={15}
                right={
                  method.slug === 'credit_card' ? (
                    <YStack alignItems="flex-end" gap={method.description ? 6 : 0} justifyContent="center" maxWidth={170}>
                      <LinearGradient
                        colors={BRAND_GRADIENT}
                        end={{ x: 1, y: 0 }}
                        start={{ x: 0, y: 0 }}
                        style={{ borderRadius: 15, paddingHorizontal: 10, paddingVertical: 3 }}
                      >
                        <Paragraph color="white" fontSize={11} fontWeight="700">
                          %100 Güvenli Ödeme
                        </Paragraph>
                      </LinearGradient>
                      {method.description ? (
                        <YStack
                          alignItems="center"
                          backgroundColor={PAYMENT_DESCRIPTION_BADGE_COLOR}
                          borderRadius={15}
                          justifyContent="center"
                          paddingHorizontal={10}
                          paddingVertical={2}
                        >
                          <Paragraph color="white" fontSize={11} fontWeight="700" lineHeight={14} textAlign="center">
                            {method.description}
                          </Paragraph>
                        </YStack>
                      ) : null}
                    </YStack>
                  ) : method.serviceFee > 0 ? (
                    <Paragraph color="$color" fontSize={13} fontWeight="700" lineHeight={16}>
                      +{formatCurrency(method.serviceFee)}
                    </Paragraph>
                  ) : null
                }
                selected={selectedSlug === method.slug}
              >
                <YStack flex={1}>
                  <Paragraph
                    color={blocked ? '$color9' : '$color'}
                    fontSize={14}
                    fontWeight="600"
                  >
                    {method.name}
                  </Paragraph>
                  {blocked ? (
                    <Paragraph color="$orange10" fontSize={11}>
                      {formatCurrency(method.maxOrderTotal ?? 0)} ve üzeri siparişlerde yalnızca kart ile
                      ödeme yapılabilir.
                    </Paragraph>
                  ) : null}
                </YStack>
              </CheckoutOptionRow>
            </YStack>
          );
        })
      )}
    </CheckoutSection>
  );
}
