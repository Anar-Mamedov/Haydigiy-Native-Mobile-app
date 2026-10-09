import { Check, ClipboardCheck, Home, Package, ShoppingBag, Truck, XCircle } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { OrderTimelineDates } from '@/types/order.types';
import { getOrderTimelineStepStates } from '../utils/order-status';

const STEP_ICONS = [ShoppingBag, ClipboardCheck, Package, Truck, Home];

type OrderTimelineProps = {
  statusId: number;
  timelineDates?: OrderTimelineDates;
};

function getTimelineDateByIndex(dates: OrderTimelineDates | undefined, index: number): string | null {
  if (!dates) return null;
  return [
    dates.orderedAt,
    dates.confirmedAt,
    dates.preparedAt,
    dates.shippedAt,
    dates.deliveredAt,
  ][index] ?? null;
}

/** Screen-reader text for a step, e.g. "Kargoya Verildi: tamamlandı, mevcut aşama, 24 Eyl 2026". */
function getStepAccessibilityLabel(
  label: string,
  reached: boolean,
  current: boolean,
  date: string | null,
): string {
  const parts = [`${label}: ${reached ? 'tamamlandı' : 'bekleniyor'}`];
  if (current) parts.push('mevcut aşama');
  if (reached && date) parts.push(date);
  return parts.join(', ');
}

function VerticalConnector({ active, hidden }: { active: boolean; hidden?: boolean }) {
  return (
    <YStack
      backgroundColor={hidden ? 'transparent' : active ? '$brand' : '$borderColor'}
      flex={1}
      minHeight={24}
      width={1}
    />
  );
}

/** Order progress stepper (Sipariş Alındı → … → Teslim Edildi), or a cancelled state. */
export function OrderTimeline({ statusId, timelineDates }: OrderTimelineProps) {
  if (statusId === 4) {
    return (
      <SectionCard borderColor="$red6" padding="$3">
        <XStack alignItems="center" gap="$3">
          <XStack
            alignItems="center"
            backgroundColor="$red2"
            borderRadius={100}
            height={32}
            justifyContent="center"
            width={32}
          >
            <XCircle color="$red10" size={16} />
          </XStack>
          <YStack>
            <Paragraph color="$red10" fontSize={13} fontWeight="700">
              Sipariş İptal Edildi
            </Paragraph>
            <Paragraph color="$red10" fontSize={11}>
              Bu sipariş iptal edilmiştir.
            </Paragraph>
          </YStack>
        </XStack>
      </SectionCard>
    );
  }

  const steps = getOrderTimelineStepStates(statusId);
  const lastIndex = steps.length - 1;

  return (
    <SectionCard padding="$4">
      <YStack gap={0}>
        {steps.map(({ label, reached, current, connectorReached }, index) => {
          const Icon = STEP_ICONS[index];
          const date = getTimelineDateByIndex(timelineDates, index);

          return (
            <XStack
              accessibilityLabel={getStepAccessibilityLabel(label, reached, current, date)}
              accessible
              alignItems="stretch"
              gap="$3"
              key={label}
            >
              <YStack alignItems="center" width={40}>
                <XStack
                  alignItems="center"
                  backgroundColor={reached ? '$brand' : '$background'}
                  borderColor={reached ? '$brand' : '$borderColor'}
                  borderRadius={100}
                  borderWidth={1}
                  height={34}
                  justifyContent="center"
                  width={34}
                >
                  {reached ? (
                    <Check color="white" size={15} />
                  ) : (
                    <Icon color="$color9" size={16} />
                  )}
                </XStack>
                <VerticalConnector active={connectorReached} hidden={index === lastIndex} />
              </YStack>
              <YStack flex={1} gap="$1" paddingBottom={index === lastIndex ? 0 : '$4'} paddingTop="$1">
                <Paragraph
                  color={reached ? '$brand' : '$color10'}
                  fontSize={13}
                  fontWeight="700"
                  lineHeight={18}
                >
                  {label}
                </Paragraph>
                {date && reached ? (
                  <Paragraph color="$color10" fontSize={11} lineHeight={16}>
                    {date}
                  </Paragraph>
                ) : null}
              </YStack>
            </XStack>
          );
        })}
      </YStack>
    </SectionCard>
  );
}
