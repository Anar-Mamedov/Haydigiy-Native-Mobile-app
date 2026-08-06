import { ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Calendar, Check, Copy, Percent, Tag, Truck } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Coupon, CouponDiscountType } from '@/types/coupon.types';
import {
  formatCouponDate,
  formatCouponPrice,
  formatDiscountLabel,
  getDiscountText,
  getRemainingDaysText,
} from '../utils/coupon-format';

// Notch circles mirror the page surface so they read as ticket perforations.
const NOTCH_SURFACE = '$color3';
const COPIED_RESET_MS = 1600;

function DiscountIcon({ type }: { type: CouponDiscountType }) {
  if (type === 'percentage') return <Percent color="$brand" size={22} strokeWidth={2.4} />;
  if (type === 'free_shipping') return <Truck color="$brand" size={22} strokeWidth={2.4} />;
  return <Tag color="$brand" size={22} strokeWidth={2.4} />;
}

function MetaChip({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$color3"
      borderRadius={100}
      gap="$1.5"
      paddingHorizontal="$2.5"
      paddingVertical="$1"
    >
      {icon}
      <Paragraph color="$color10" fontSize={12}>
        {label}
      </Paragraph>
    </XStack>
  );
}

type CouponCardProps = {
  coupon: Coupon;
};

/** Ticket-style coupon: a brand stub with the discount, plus details and a copy button. */
export function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(coupon.couponCode);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  const hasConstraints =
    coupon.minOrderAmount != null ||
    coupon.maxDiscountAmount != null ||
    coupon.minItemCount != null;

  return (
    <XStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$6"
      borderWidth={1}
      overflow="hidden"
      position="relative"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.18}
      shadowRadius={8}
    >
      <CardNotch side="left" />
      <CardNotch side="right" />

      {/* Discount stub */}
      <YStack
        alignItems="center"
        backgroundColor="$brand"
        gap="$2"
        justifyContent="center"
        paddingHorizontal="$3"
        paddingVertical="$4"
        width={96}
      >
        <XStack
          alignItems="center"
          backgroundColor="white"
          borderRadius={100}
          height={44}
          justifyContent="center"
          width={44}
        >
          <DiscountIcon type={coupon.discountType} />
        </XStack>
        <Paragraph color="white" fontSize={17} fontWeight="800" lineHeight={20} textAlign="center">
          {formatDiscountLabel(coupon)}
        </Paragraph>
        <Paragraph color="white" fontSize={11} fontWeight="600" opacity={0.9} textAlign="center">
          {getDiscountText(coupon.discountType)}
        </Paragraph>
      </YStack>

      {/* Details */}
      <YStack flex={1} gap="$2" paddingHorizontal="$3" paddingVertical="$3">
        <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
          <YStack flex={1}>
            <Paragraph color="$color" fontSize={15} fontWeight="700" numberOfLines={1}>
              {coupon.name || 'İndirim Kuponu'}
            </Paragraph>
            <Paragraph color="$brand" fontSize={12} fontWeight="600" marginTop={2}>
              {getRemainingDaysText(coupon.endDate)}
            </Paragraph>
          </YStack>
          <XStack
            alignItems="center"
            backgroundColor={coupon.isUserSpecific ? '$green3' : '$color3'}
            borderRadius={100}
            paddingHorizontal="$2.5"
            paddingVertical="$1"
          >
            <Paragraph
              color={coupon.isUserSpecific ? '$green10' : '$color10'}
              fontSize={11}
              fontWeight="700"
            >
              {coupon.isUserSpecific ? 'Size özel' : 'Genel'}
            </Paragraph>
          </XStack>
        </XStack>

        {coupon.description ? (
          <Paragraph color="$color10" fontSize={13} lineHeight={18}>
            {coupon.description}
          </Paragraph>
        ) : null}

        <XStack
          borderStyle="dashed"
          borderTopColor="$brand"
          borderTopWidth={1}
          marginVertical="$1"
          opacity={0.5}
        />

        {/* Code + copy */}
        <XStack alignItems="center" gap="$2">
          <YStack
            backgroundColor="$color2"
            borderColor="$brand"
            borderRadius="$3"
            borderWidth={1}
            flex={1}
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            <Paragraph color="$color10" fontSize={10} fontWeight="600" letterSpacing={0.5}>
              KUPON KODU
            </Paragraph>
            <Paragraph color="$color" fontSize={15} fontWeight="800" numberOfLines={1}>
              {coupon.couponCode}
            </Paragraph>
          </YStack>
          <Pressable
            accessibilityLabel={`${coupon.couponCode} kupon kodunu kopyala`}
            accessibilityRole="button"
            onPress={handleCopy}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              alignItems="center"
              backgroundColor="$brand"
              borderRadius="$3"
              height={48}
              justifyContent="center"
              width={48}
            >
              {copied ? <Check color="white" size={20} /> : <Copy color="white" size={20} />}
            </XStack>
          </Pressable>
        </XStack>

        <XStack flexWrap="wrap" gap="$2">
          <MetaChip
            icon={<Calendar color="$color10" size={13} />}
            label={`${formatCouponDate(coupon.startDate)} - ${formatCouponDate(coupon.endDate)}`}
          />
          {coupon.isCombinable ? <MetaChip label="Birleştirilebilir" /> : null}
        </XStack>

        {hasConstraints ? (
          <YStack gap={2}>
            {coupon.minOrderAmount != null ? (
              <Paragraph color="$color10" fontSize={12}>
                Minimum sipariş: {formatCouponPrice(coupon.minOrderAmount)} TL
              </Paragraph>
            ) : null}
            {coupon.maxDiscountAmount != null ? (
              <Paragraph color="$color10" fontSize={12}>
                Maksimum indirim: {formatCouponPrice(coupon.maxDiscountAmount)} TL
              </Paragraph>
            ) : null}
            {coupon.minItemCount != null ? (
              <Paragraph color="$color10" fontSize={12}>
                Minimum ürün adedi: {coupon.minItemCount}
              </Paragraph>
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </XStack>
  );
}

/** A half-circle cut-out on the card edge, clipped by the card's overflow:hidden. */
function CardNotch({ side }: { side: 'left' | 'right' }) {
  return (
    <XStack
      backgroundColor={NOTCH_SURFACE}
      borderColor="$borderColor"
      borderRadius={100}
      borderWidth={1}
      height={16}
      marginTop={-8}
      position="absolute"
      top="50%"
      width={16}
      zIndex={1}
      {...(side === 'left' ? { left: -9 } : { right: -9 })}
    />
  );
}
