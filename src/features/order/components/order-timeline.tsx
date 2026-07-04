import { ClipboardCheck, Home, Package, ShoppingBag, Truck, XCircle } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { getOrderTimelineActiveIndex, ORDER_TIMELINE_STEPS } from '../utils/order-status';

const STEP_ICONS = [ShoppingBag, ClipboardCheck, Package, Truck, Home];

type OrderTimelineProps = {
  statusId: number;
};

function Connector({ active, hidden }: { active: boolean; hidden?: boolean }) {
  return (
    <YStack
      backgroundColor={hidden ? 'transparent' : active ? '$brand' : '$borderColor'}
      flex={1}
      height={2}
    />
  );
}

/** Order progress stepper (Sipariş Alındı → … → Teslim Edildi), or a cancelled state. */
export function OrderTimeline({ statusId }: OrderTimelineProps) {
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

  const activeIndex = getOrderTimelineActiveIndex(statusId);
  const lastIndex = ORDER_TIMELINE_STEPS.length - 1;

  return (
    <SectionCard padding="$3">
      <XStack>
        {ORDER_TIMELINE_STEPS.map((label, index) => {
          const Icon = STEP_ICONS[index];
          const reached = index <= activeIndex;

          return (
            <YStack alignItems="center" flex={1} gap="$2" key={label}>
              <XStack alignItems="center" width="100%">
                <Connector active={index <= activeIndex} hidden={index === 0} />
                <XStack
                  alignItems="center"
                  backgroundColor={reached ? '$brand' : '$backgroundHover'}
                  borderColor={reached ? '$brand' : '$borderColor'}
                  borderRadius={100}
                  borderWidth={1}
                  height={32}
                  justifyContent="center"
                  width={32}
                >
                  <Icon color={reached ? 'white' : '$color9'} size={16} />
                </XStack>
                <Connector active={index < activeIndex} hidden={index === lastIndex} />
              </XStack>
              <Paragraph
                color={reached ? '$color' : '$color10'}
                fontSize={10}
                fontWeight={reached ? '700' : '500'}
                lineHeight={13}
                numberOfLines={2}
                textAlign="center"
              >
                {label}
              </Paragraph>
            </YStack>
          );
        })}
      </XStack>
    </SectionCard>
  );
}
