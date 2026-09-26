import { Pressable } from 'react-native';
import { Separator, XStack, YStack } from 'tamagui';
import { CheckCircle, ChevronRight, Info, TicketPercent, X } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';
import { ApplyCoupon, useCheckoutCouponSheet } from '../hooks/use-checkout-coupon-sheet';
import { CouponCartSnapshot, getAppliedCouponDiscountText } from '../utils/checkout-coupon';
import { CheckoutCouponSheet } from './checkout-coupon-sheet';

interface CheckoutCouponSectionProps {
  onApplyCoupon: ApplyCoupon;
  onRemoveCoupon: () => void;
  couponError: string | null;
  appliedCoupon: AppliedCoupon | null;
  isApplyingCoupon: boolean;
  isRemovingCoupon: boolean;
  coupons: Coupon[];
  isCouponsLoading: boolean;
  /** Kupon şartlarının (alt limit, ürün adedi) karşılaştırıldığı sepet değerleri. */
  cart: CouponCartSnapshot;
  /** Locks coupon actions while `/order/token` is in flight (see `isCheckoutLocked`). */
  disabled?: boolean;
}

function AppliedCouponBanner({
  coupon,
  isRemoveDisabled,
  onRemove,
}: {
  coupon: AppliedCoupon;
  isRemoveDisabled: boolean;
  onRemove: () => void;
}) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$green2"
      borderColor="$green6"
      borderRadius="$5"
      borderWidth={1}
      gap="$3"
      minHeight={82}
      paddingLeft="$3.5"
      paddingRight="$8"
      paddingVertical="$3"
    >
      <YStack
        alignItems="center"
        backgroundColor="$discountBadge"
        borderRadius={100}
        height={36}
        justifyContent="center"
        width={36}
      >
        <CheckCircle color="white" size={20} strokeWidth={2.5} />
      </YStack>
      <YStack flex={1} gap="$1" minWidth={0}>
        <XStack alignItems="center" gap="$1.5">
          <Paragraph color="$green11" flexShrink={1} fontSize={14} fontWeight="800" numberOfLines={1}>
            {coupon.code}
          </Paragraph>
          <XStack backgroundColor="$green4" borderRadius={100} paddingHorizontal="$1.5" paddingVertical={2}>
            <Paragraph color="$green11" fontSize={9} fontWeight="700" letterSpacing={0.5}>
              UYGULANDI
            </Paragraph>
          </XStack>
        </XStack>
        <Paragraph color="$green11" fontSize={11}>
          {coupon.isFreeShipping
            ? 'Ücretsiz kargo avantajın aktif.'
            : 'Kupon indirimin sepetine yansıtıldı.'}
        </Paragraph>
      </YStack>
      <XStack
        backgroundColor="$background"
        borderColor="$green6"
        borderRadius="$3"
        borderWidth={1}
        flexShrink={0}
        paddingHorizontal="$2.5"
        paddingVertical="$1.5"
      >
        <Paragraph color="$green11" fontSize={11} fontWeight="800">
          {getAppliedCouponDiscountText(coupon)}
        </Paragraph>
      </XStack>
      <Pressable
        accessibilityLabel="Uygulanan kuponu kaldır"
        accessibilityRole="button"
        accessibilityState={{ disabled: isRemoveDisabled }}
        disabled={isRemoveDisabled}
        hitSlop={8}
        onPress={onRemove}
        style={{ opacity: isRemoveDisabled ? 0.5 : 1, position: 'absolute', right: 8, top: 8 }}
      >
        <X color="$green11" size={14} strokeWidth={2.5} />
      </Pressable>
    </XStack>
  );
}

function CouponPrompt({ onOpen }: { onOpen: () => void }) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$orange2"
      borderRadius="$3"
      gap="$2"
      minHeight={72}
      paddingHorizontal="$3"
    >
      <Info color="$brand" size={20} />
      <YStack flex={1} gap="$1" paddingVertical="$2">
        <Paragraph color="$color" fontSize={12} lineHeight={16}>
          Kupon avantajından yararlanmak için bir kupon seç veya kod ekle.
        </Paragraph>
        <Pressable accessibilityLabel="Kuponları Gör" accessibilityRole="button" hitSlop={8} onPress={onOpen}>
          <Paragraph color="$brand" fontSize={12} fontWeight="600">
            Kuponları Gör
          </Paragraph>
        </Pressable>
      </YStack>
    </XStack>
  );
}

/** Ödeme ekranındaki "Kuponlarım" kartı; kupon ekleme ve seçme "Kuponlarım" sayfasında yapılır. */
export function CheckoutCouponSection({
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  appliedCoupon,
  isApplyingCoupon,
  isRemovingCoupon,
  coupons,
  isCouponsLoading,
  cart,
  disabled = false,
}: CheckoutCouponSectionProps) {
  const sheet = useCheckoutCouponSheet(onApplyCoupon);

  return (
    <>
      <SectionCard overflow="hidden" padding={0}>
        <Pressable
          accessibilityHint="Kuponlarını görüntüler veya kupon kodu eklemeni sağlar"
          accessibilityLabel="Kuponlarım"
          accessibilityRole="button"
          onPress={sheet.open}
        >
          <XStack alignItems="center" gap="$2" paddingHorizontal="$3.5" paddingVertical="$3">
            <TicketPercent color="$color" size={16} />
            <Paragraph color="$color" fontSize={15} fontWeight="700">
              Kuponlarım
            </Paragraph>
            <ChevronRight color="$color" size={16} />
            <Paragraph color="$brand" fontSize={13} fontWeight="600" marginLeft="auto">
              + Kupon Kodu Ekle
            </Paragraph>
          </XStack>
        </Pressable>
        <Separator borderColor="$borderColor" />
        <YStack gap="$2" padding="$3">
          {appliedCoupon ? (
            <AppliedCouponBanner
              coupon={appliedCoupon}
              isRemoveDisabled={disabled || isRemovingCoupon}
              onRemove={onRemoveCoupon}
            />
          ) : (
            <CouponPrompt onOpen={sheet.open} />
          )}
          {/* Sayfa kapalıyken de kupon hatası (ör. ödeme yöntemi değişince düşen kupon) görünsün. */}
          {couponError && !sheet.isOpen ? (
            <Paragraph accessibilityLiveRegion="polite" color="$red10" fontSize={12}>
              {couponError}
            </Paragraph>
          ) : null}
        </YStack>
      </SectionCard>

      <CheckoutCouponSheet
        appliedCoupon={appliedCoupon}
        cart={cart}
        code={sheet.code}
        couponError={couponError}
        coupons={coupons}
        disabled={disabled}
        isApplyingCoupon={isApplyingCoupon}
        isCouponsLoading={isCouponsLoading}
        onApplyCode={sheet.applyTypedCode}
        onApplyCoupon={sheet.applyCoupon}
        onClose={sheet.close}
        onCodeChange={sheet.setCode}
        open={sheet.isOpen}
      />
    </>
  );
}
