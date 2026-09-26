import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Clock, TicketPercent, Truck } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { formatCouponDate } from '@/features/coupon/utils/coupon-format';
import { Coupon } from '@/types/coupon.types';
import { formatCurrency } from '@/utils/format-currency';
import {
  CouponTicketState,
  getCouponBenefitLabel,
  getCouponValueLabel,
} from '../utils/checkout-coupon';

/**
 * Kartın her durumdaki renkleri. Renkli bölümün zemini iki temada da sabit kalan ya da
 * beyaz yazıyı taşıyacak kadar koyu token'lardan seçildi; buton metni zemin üzerinde okunur.
 */
const TICKET_TONES = {
  applied: {
    surface: '$discountBackground',
    icon: '$discount',
    stub: '$discountBadge',
    actionText: '$discount',
  },
  selectable: { surface: '$background', icon: '$brand', stub: '$brand', actionText: '$brand' },
  unavailable: { surface: '$color4', icon: '$color9', stub: '$color9', actionText: '$color10' },
} as const;

const ACTION_LABELS: Record<CouponTicketState, string> = {
  applied: 'Uygulandı',
  selectable: 'Kodu Uygula',
  unavailable: 'Şart sağlanmadı',
};

type CheckoutCouponTicketProps = {
  coupon: Coupon;
  state: CouponTicketState;
  expiryLabel: string | null;
  /** Sipariş tutarı güncellenirken ya da kupon doğrulanırken kart dokunulmaz olur. */
  disabled?: boolean;
  onApply: (code: string) => void;
};

function ExpiryBadge({ label, isApplied }: { label: string; isApplied: boolean }) {
  const color = isApplied ? '$green11' : '$yellow11';
  return (
    <XStack
      alignItems="center"
      backgroundColor={isApplied ? '$green4' : '$yellow4'}
      borderRadius={100}
      flexShrink={0}
      gap="$1"
      paddingHorizontal="$2"
      paddingVertical={3}
    >
      <Clock color={color} size={11} />
      <Paragraph color={color} fontSize={9} fontWeight="700">
        {label}
      </Paragraph>
    </XStack>
  );
}

/** "Kuponlarım" sayfasındaki bilet görünümlü kupon kartı (web ödeme sayfası paritesi). */
export function CheckoutCouponTicket({
  coupon,
  state,
  expiryLabel,
  disabled = false,
  onApply,
}: CheckoutCouponTicketProps) {
  const tone = TICKET_TONES[state];
  const canApply = state === 'selectable' && !disabled;
  const DiscountIcon = coupon.discountType === 'free_shipping' ? Truck : TicketPercent;

  return (
    <Pressable
      accessibilityLabel={`${coupon.couponCode} kuponu, ${ACTION_LABELS[state]}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !canApply, selected: state === 'applied' }}
      disabled={!canApply}
      onPress={() => onApply(coupon.couponCode)}
    >
      <YStack
        borderRadius="$6"
        opacity={disabled ? 0.6 : 1}
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.18}
        shadowRadius={8}
      >
        <XStack
          borderColor="$borderColor"
          borderRadius="$6"
          borderWidth={1}
          minHeight={140}
          overflow="hidden"
        >
          <XStack
            alignItems="center"
            backgroundColor={tone.surface}
            flex={1}
            gap="$2.5"
            paddingHorizontal="$3"
            paddingVertical="$4"
          >
            <DiscountIcon color={tone.icon} size={34} strokeWidth={1.8} />
            <YStack flex={1} gap="$1" minWidth={0}>
              <XStack alignItems="center" gap="$2">
                <Paragraph color="$color" flexShrink={1} fontSize={16} fontWeight="900" numberOfLines={1}>
                  {coupon.couponCode}
                </Paragraph>
                {expiryLabel ? <ExpiryBadge isApplied={state === 'applied'} label={expiryLabel} /> : null}
              </XStack>
              <Paragraph color="$color11" fontSize={11} fontWeight="500">
                {coupon.minOrderAmount
                  ? `Alt Limit: ${formatCurrency(coupon.minOrderAmount)}`
                  : 'Tüm siparişlerde geçerli'}
              </Paragraph>
              {coupon.minItemCount != null ? (
                <Paragraph color="$color11" fontSize={10} fontWeight="500">
                  Minimum {coupon.minItemCount} ürün ile geçerli
                </Paragraph>
              ) : null}
              <Paragraph color="$color10" fontSize={10} marginTop="$1">
                Son kullanım: {formatCouponDate(coupon.endDate)}
              </Paragraph>
            </YStack>
          </XStack>

          <YStack
            alignItems="center"
            backgroundColor={tone.stub}
            justifyContent="center"
            minWidth={110}
            paddingHorizontal="$2"
            width="40%"
          >
            {/*
              Paragraph varsayılan 22 pt satır yüksekliği taşıyor; font 28 pt olunca rakamların
              üstü kesiliyordu. Satır yüksekliği fontla birlikte verilmeli.
            */}
            <Paragraph
              adjustsFontSizeToFit
              color="white"
              fontSize={28}
              fontWeight="900"
              lineHeight={34}
              minimumFontScale={0.6}
              numberOfLines={1}
            >
              {getCouponValueLabel(coupon)}
            </Paragraph>
            <Paragraph color="white" fontSize={14} fontWeight="800">
              {getCouponBenefitLabel(coupon)}
            </Paragraph>
            <XStack
              backgroundColor="$background"
              borderRadius="$4"
              marginTop="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Paragraph color={tone.actionText} fontSize={12} fontWeight="700">
                {ACTION_LABELS[state]}
              </Paragraph>
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </Pressable>
  );
}
