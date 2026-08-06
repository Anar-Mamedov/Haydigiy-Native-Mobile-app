import { Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from '@/components/ui/icons';
import { Button, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { formatCurrency } from '@/utils/format-currency';

type CartSummaryBarProps = {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  expanded: boolean;
  isCheckingOut?: boolean;
  onToggle: () => void;
  onCheckout: () => void;
};

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Paragraph color="$color10" fontSize={13}>
        {label}
      </Paragraph>
      <Paragraph
        color={emphasize ? '$color' : '$color11'}
        fontSize={13}
        fontWeight={emphasize ? '700' : '500'}
      >
        {value}
      </Paragraph>
    </XStack>
  );
}

/**
 * Bottom-anchored cart summary. The collapsible panel reveals the price
 * breakdown while the always-visible footer shows the grand total and the
 * checkout action, mirroring the web cart's expandable summary.
 */
export function CartSummaryBar({
  subtotal,
  discount,
  total,
  itemCount,
  expanded,
  isCheckingOut,
  onToggle,
  onCheckout,
}: CartSummaryBarProps) {
  return (
    <YStack
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      width="100%"
    >
      {expanded ? (
        <YStack
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          gap="$2"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <SummaryRow label="Ara Toplam" value={formatCurrency(subtotal)} />
          {discount > 0 ? (
            <SummaryRow label="İndirim" value={`- ${formatCurrency(discount)}`} />
          ) : null}
          <SummaryRow emphasize label="Toplam" value={formatCurrency(total)} />
        </YStack>
      ) : null}

      <XStack
        alignItems="center"
        gap="$3"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <XStack alignItems="center" flex={1} gap="$2">
          <Pressable
            accessibilityLabel={expanded ? 'Özeti gizle' : 'Özeti göster'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onToggle}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 2 })}
          >
            {expanded ? (
              <ChevronDown color="$brand" size={22} />
            ) : (
              <ChevronUp color="$brand" size={22} />
            )}
          </Pressable>
          <YStack>
            <Paragraph color="$color10" fontSize={11}>
              Toplam
            </Paragraph>
            <Paragraph color="$color" fontSize={17} fontWeight="800">
              {formatCurrency(total)}
            </Paragraph>
          </YStack>
        </XStack>

        <Button
          accessibilityLabel="Sepeti onayla"
          accessibilityRole="button"
          backgroundColor="$brand"
          borderRadius="$4"
          disabled={isCheckingOut || itemCount === 0}
          height={46}
          onPress={onCheckout}
          opacity={isCheckingOut || itemCount === 0 ? 0.6 : 1}
          paddingHorizontal="$4"
          pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
        >
          <XStack alignItems="center" gap="$2">
            {isCheckingOut ? <Spinner color="white" size="small" /> : null}
            <Paragraph color="white" fontSize={14} fontWeight="700">
              {isCheckingOut ? 'Kontrol ediliyor...' : `Sepeti Onayla (${itemCount})`}
            </Paragraph>
          </XStack>
        </Button>
      </XStack>
    </YStack>
  );
}
