import React from 'react';
import { Package } from '@tamagui/lucide-icons-2';
import { XStack, YStack, Paragraph, useTheme, useThemeName } from 'tamagui';
import Svg, { Path } from 'react-native-svg';

export interface ShippingEstimate {
  message?: string;
  estimated_delivery_day_human?: string;
  avg_delivery_days?: number;
  delivery_warning?: {
    show?: boolean;
    type?: string;
    message?: string;
  } | null;
}

interface ProductDeliveryInfoProps {
  estimate?: ShippingEstimate | null;
}

function FastDeliveryIcon({ width = 28, height = 17 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 12" fill="none">
      <Path d="M10.5439 9.95461C10.5439 11.0819 11.4814 11.9995 12.6332 11.9995C13.7857 11.9995 14.723 11.0817 14.723 9.95461C14.723 8.82766 13.7855 7.91016 12.6332 7.91016C11.4814 7.91031 10.5439 8.8275 10.5439 9.95461ZM11.8649 9.95461C11.8649 9.54022 12.2096 9.20291 12.6331 9.20291C13.0565 9.20291 13.4018 9.54024 13.4018 9.95461C13.4018 10.3695 13.0567 10.7068 12.6331 10.7068C12.2096 10.7068 11.8649 10.3696 11.8649 9.95461Z" fill="#0BC15C" />
      <Path d="M1.45117 9.95461C1.45117 11.0819 2.38864 11.9995 3.54095 11.9995C4.69293 11.9995 5.63025 11.0817 5.63025 9.95461C5.63025 8.82766 4.69278 7.91016 3.54095 7.91016C2.38896 7.91031 1.45117 8.8275 1.45117 9.95461ZM2.7726 9.95461C2.7726 9.54022 3.11748 9.20291 3.54095 9.20291C3.96441 9.20291 4.30914 9.54024 4.30914 9.95461C4.30914 10.3695 3.96441 10.7068 3.54095 10.7068C3.11749 10.7068 2.7726 10.3696 2.7726 9.95461Z" fill="#0BC15C" />
      <Path d="M13.7344 1.04688H19.9997V1.79268H13.7344V1.04688Z" fill="#0BC15C" />
      <Path d="M16.1003 4.54988V4.16872L13.3079 4.16856V2.58944H16.1003V2.20812H13.3079V0.628846H16.0625C15.9565 0.266791 15.6193 0 15.2157 0H7.47269C6.98366 0 6.58745 0.387539 6.58745 0.865628V6.97508H6.02262L6.02247 1.51564H1.05715C1.05715 1.51564 0 5.48441 0 5.79699V8.92413H0.683113C1.1131 7.78685 2.22775 6.97384 3.53937 6.97384C4.85131 6.97384 5.96644 7.7867 6.39611 8.92413H9.77755C10.2074 7.78685 11.3217 6.97384 12.6337 6.97384C13.9309 6.97384 15.0361 7.76755 15.476 8.88542C15.8375 8.77621 16.0998 8.44707 16.0998 8.058V6.12941H13.3078V4.55013L16.1003 4.54988ZM5.11297 5.00279H1.27813L1.86839 2.54938H5.11297V5.00279Z" fill="#0BC15C" />
      <Path d="M13.7344 3.00391H18.8993V3.74971H13.7344V3.00391Z" fill="#0BC15C" />
      <Path d="M13.7344 4.96094H17.5446V5.70674H13.7344V4.96094Z" fill="#0BC15C" />
    </Svg>
  );
}

export function ProductDeliveryInfo({ estimate }: ProductDeliveryInfoProps) {
  const theme = useTheme();
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

  // Fallback / Default mock data matching the holiday season in screenshots
  const defaultEstimate: ShippingEstimate = {
    message: 'Bugün sipariş verirsen yarın kargoda',
    estimated_delivery_day_human: '03 Haziran Çarşamba',
    avg_delivery_days: 3,
    delivery_warning: {
      show: true,
      type: 'holiday_period',
      message: 'Siparişiniz bayrama yetişmeyebilir. Kurban Bayramı tatili boyunca teslimat yapılmamaktadır. Tahmini teslimatınız bayram sonrası: 03 Haziran Çarşamba.',
    },
  };

  const currentEstimate = estimate || defaultEstimate;
  const dispatchText = currentEstimate.message || 'Yükleniyor...';
  const deliveryDay = currentEstimate.estimated_delivery_day_human || '';
  const hasWarning = Boolean(currentEstimate.delivery_warning?.show);
  const warningMessage = currentEstimate.delivery_warning?.message;

  const cardBg = isDark ? '#1F2937' : '#F9F9F9';
  const containerBorder = isDark ? theme.borderColor.val : '#E5E7EB';

  const teslimLabel = hasWarning && currentEstimate.delivery_warning?.type === 'holiday_period' 
    ? 'Tahmini teslimat (bayram sonrası)' 
    : 'Tahmini Teslim';

  return (
    <YStack
      backgroundColor={cardBg as any}
      borderColor={containerBorder as any}
      borderWidth={1}
      borderRadius={8}
      marginHorizontal="$4"
      marginVertical="$2"
      padding={10}
      gap={10}
    >
      {/* Dispatch Estimate (Kargoya Teslim) */}
      <XStack alignItems="center" gap="$2">
        <Package size={16} color={isDark ? '#9CA3AF' : '#9CA3AF'} strokeWidth={1.75} />
        <Paragraph fontSize={12.5} lineHeight={18} color="$color" minWidth={0} flex={1}>
          <Paragraph color={isDark ? '$color10' : '#6B7280'} fontSize={12.5}>
            Tahmini Kargoya Teslim:{' '}
          </Paragraph>
          <Paragraph fontWeight="600" fontSize={12.5} color={isDark ? '$color' : '#1F2937'}>
            {dispatchText}
          </Paragraph>
        </Paragraph>
      </XStack>

      {deliveryDay && (
        <>
          {/* Divider */}
          <YStack height={1} backgroundColor={containerBorder as any} />

          {/* Arrival Estimate (Teslimat) */}
          <XStack alignItems="flex-start" gap="$2.5" paddingTop={2.5}>
            <XStack
              width={44}
              height={44}
              borderRadius={6}
              borderWidth={1}
              borderColor={isDark ? '#374151' : '#E5E7EB'}
              backgroundColor={isDark ? '#111827' : 'white'}
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <FastDeliveryIcon />
            </XStack>

            <YStack flex={1} gap={4}>
              <Paragraph fontSize={12.5} color={isDark ? '$color' : '#111827'} lineHeight={17}>
                <Paragraph fontWeight="600" color={isDark ? '$color' : '#111827'}>
                  {teslimLabel}:{' '}
                </Paragraph>
                <Paragraph fontWeight="700" color={isDark ? '$color' : '#111827'}>
                  {deliveryDay} kapında!
                </Paragraph>
              </Paragraph>

              {hasWarning && warningMessage && (
                <Paragraph fontSize={11.5} color={isDark ? '#FCD34D' : '#78350F'} flex={1} lineHeight={16} marginTop={4}>
                  {warningMessage}
                </Paragraph>
              )}
            </YStack>
          </XStack>
        </>
      )}
    </YStack>
  );
}
