import { Pressable } from 'react-native';
import { Input, Paragraph, XStack, YStack } from 'tamagui';
import { CheckoutSection } from './checkout-section';
import { AppButton } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';

interface CheckoutCouponSectionProps {
  couponInput: string;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: (code?: string) => void;
  onRemoveCoupon: () => void;
  couponError: string | null;
  appliedCoupon: AppliedCoupon | null;
  isApplyingCoupon: boolean;
  isRemovingCoupon: boolean;
  coupons: Coupon[];
  isCouponsLoading: boolean;
}

function discountTypeText(coupon: AppliedCoupon): string {
  if (coupon.discountType === 'percentage') return `%${coupon.discountValue} İndirim`;
  if (coupon.discountType === 'fixed') return `${formatCurrency(coupon.discountValue)} İndirim`;
  return 'Ücretsiz Kargo';
}

export function CheckoutCouponSection({
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  appliedCoupon,
  isApplyingCoupon,
  isRemovingCoupon,
  coupons,
  isCouponsLoading,
}: CheckoutCouponSectionProps) {
  return (
    <CheckoutSection title="Kupon Kodu">
      <YStack gap="$3">
        {appliedCoupon ? (
          <XStack
            alignItems="center"
            backgroundColor="$green2"
            borderColor="$green7"
            borderRadius="$4"
            borderWidth={1}
            gap="$2"
            justifyContent="space-between"
            padding="$3"
          >
            <YStack flex={1}>
              <Paragraph color="$green11" fontSize={14} fontWeight="700">
                {appliedCoupon.code}
              </Paragraph>
              <Paragraph color="$green10" fontSize={12}>
                {discountTypeText(appliedCoupon)}
                {appliedCoupon.discount > 0 ? ` • -${formatCurrency(appliedCoupon.discount)}` : ''}
              </Paragraph>
            </YStack>
            <Pressable
              accessibilityLabel="Kuponu kaldır"
              accessibilityRole="button"
              disabled={isRemovingCoupon}
              onPress={onRemoveCoupon}
            >
              <Paragraph color="$red10" fontSize={13} fontWeight="600">
                {isRemovingCoupon ? 'Kaldırılıyor...' : 'Kaldır'}
              </Paragraph>
            </Pressable>
          </XStack>
        ) : (
          <XStack gap="$2">
            <Input
              accessibilityLabel="Kupon kodu"
              autoCapitalize="characters"
              backgroundColor="$background"
              borderColor="$borderColor"
              flex={1}
              height={44}
              onChangeText={onCouponInputChange}
              placeholder="Kupon Kodu (Zorunlu Değildir)"
              value={couponInput}
            />
            <AppButton
              backgroundColor="$brand"
              color="white"
              disabled={isApplyingCoupon || !couponInput.trim()}
              height={44}
              onPress={() => onApplyCoupon()}
              opacity={isApplyingCoupon || !couponInput.trim() ? 0.5 : 1}
            >
              {isApplyingCoupon ? 'Kontrol...' : 'Uygula'}
            </AppButton>
          </XStack>
        )}

        {couponError ? (
          <Paragraph color="$red10" fontSize={13}>
            {couponError}
          </Paragraph>
        ) : null}

        {!appliedCoupon && coupons.length > 0 ? (
          <YStack gap="$2">
            <Paragraph color="$color10" fontSize={12}>
              {isCouponsLoading ? 'Kuponlar yükleniyor...' : 'Kullanılabilir kuponlar'}
            </Paragraph>
            <XStack flexWrap="wrap" gap="$2">
              {coupons.slice(0, 6).map((coupon) => (
                <Pressable
                  accessibilityLabel={`${coupon.couponCode} kuponunu uygula`}
                  accessibilityRole="button"
                  disabled={isApplyingCoupon}
                  key={coupon.id}
                  onPress={() => onApplyCoupon(coupon.couponCode)}
                >
                  <XStack
                    borderColor="$brand"
                    borderRadius="$3"
                    borderWidth={1}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1.5"
                  >
                    <Paragraph color="$brand" fontSize={12} fontWeight="600">
                      {coupon.couponCode}
                    </Paragraph>
                  </XStack>
                </Pressable>
              ))}
            </XStack>
          </YStack>
        ) : null}
      </YStack>
    </CheckoutSection>
  );
}
