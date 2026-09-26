import { Pressable } from 'react-native';
import { Separator, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { Info, X } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';
import {
  CouponCartSnapshot,
  getCouponExpiryLabel,
  getCouponTicketState,
} from '../utils/checkout-coupon';
import { CheckoutCouponTicket } from './checkout-coupon-ticket';

type CheckoutCouponSheetProps = {
  open: boolean;
  onClose: () => void;
  code: string;
  onCodeChange: (code: string) => void;
  onApplyCode: () => void;
  onApplyCoupon: (code: string) => void;
  coupons: Coupon[];
  isCouponsLoading: boolean;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  cart: CouponCartSnapshot;
  /** Sipariş tutarı güncellenirken (order/token) kupon işlemleri kilitlenir. */
  disabled?: boolean;
};

type CouponListProps = Pick<
  CheckoutCouponSheetProps,
  'coupons' | 'isCouponsLoading' | 'appliedCoupon' | 'cart' | 'onApplyCoupon'
> & { isLocked: boolean };

function CouponList({ coupons, isCouponsLoading, appliedCoupon, cart, onApplyCoupon, isLocked }: CouponListProps) {
  if (isCouponsLoading) {
    return (
      <YStack alignItems="center" gap="$2" paddingVertical="$4">
        <Spinner color="$brand" />
        <Paragraph color="$color10" fontSize={13}>
          Kuponlar yükleniyor...
        </Paragraph>
      </YStack>
    );
  }

  if (coupons.length === 0) {
    return (
      <XStack alignItems="center" backgroundColor="$orange2" borderRadius="$3" gap="$2" padding="$4">
        <Info color="$brand" size={16} />
        <Paragraph color="$color11" flex={1} fontSize={13}>
          Şu an kullanabileceğin bir kupon bulunmuyor.
        </Paragraph>
      </XStack>
    );
  }

  return (
    <YStack gap="$3">
      {coupons.map((coupon) => (
        <CheckoutCouponTicket
          coupon={coupon}
          disabled={isLocked}
          expiryLabel={getCouponExpiryLabel(coupon.endDate)}
          key={coupon.id}
          onApply={onApplyCoupon}
          state={getCouponTicketState(coupon, appliedCoupon, cart)}
        />
      ))}
    </YStack>
  );
}

/** "Kuponlarım" sayfası: kod ile kupon ekleme ve kullanılabilir kuponlar listesi. */
export function CheckoutCouponSheet({
  open,
  onClose,
  code,
  onCodeChange,
  onApplyCode,
  onApplyCoupon,
  coupons,
  isCouponsLoading,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
  cart,
  disabled = false,
}: CheckoutCouponSheetProps) {
  const isLocked = disabled || isApplyingCoupon;
  const canApplyCode = !isLocked && code.trim().length > 0;
  // Doğrulama sürerken ikinci dokunuş aynı kodu tekrar göndermesin.
  const applyCodeIfAllowed = () => {
    if (canApplyCode) onApplyCode();
  };

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      moveOnKeyboardChange
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        maxHeight="92%"
        overflow="visible"
        testID="checkout-coupon-sheet-frame"
      >
        <SheetBottomCover testID="checkout-coupon-sheet-bottom-cover" />

        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="center"
          paddingHorizontal="$4"
          paddingVertical="$4"
        >
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            Kuponlarım
          </Paragraph>
          <Pressable
            accessibilityLabel="Kuponları kapat"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={{ position: 'absolute', right: 16 }}
          >
            <X color="$color11" size={24} />
          </Pressable>
        </XStack>

        <KeyboardAwareSheetScrollView testID="checkout-coupon-keyboard-aware-scroll">
          <YStack gap="$3" padding="$4">
            <AppInput
              autoCapitalize="characters"
              autoCorrect={false}
              disabled={disabled}
              height={48}
              hideVisibleLabel
              label="Kupon Kodu"
              onChangeText={onCodeChange}
              onSubmitEditing={applyCodeIfAllowed}
              opacity={disabled ? 0.6 : 1}
              placeholder="Kupon Kodu"
              returnKeyType="done"
              value={code}
            />
            <AppButton
              backgroundColor="$color"
              borderColor="transparent"
              color="$background"
              disabled={!canApplyCode}
              height={48}
              onPress={applyCodeIfAllowed}
              opacity={canApplyCode ? 1 : 0.5}
              pressStyle={{ backgroundColor: '$color', opacity: 0.85 }}
            >
              {isApplyingCoupon ? 'Kontrol ediliyor...' : 'Kuponu Uygula'}
            </AppButton>
            {couponError ? (
              <Paragraph accessibilityLiveRegion="polite" color="$red10" fontSize={13}>
                {couponError}
              </Paragraph>
            ) : null}

            <Separator borderColor="$borderColor" marginVertical="$1" />

            <CouponList
              appliedCoupon={appliedCoupon}
              cart={cart}
              coupons={coupons}
              isCouponsLoading={isCouponsLoading}
              isLocked={isLocked}
              onApplyCoupon={onApplyCoupon}
            />
          </YStack>
        </KeyboardAwareSheetScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
