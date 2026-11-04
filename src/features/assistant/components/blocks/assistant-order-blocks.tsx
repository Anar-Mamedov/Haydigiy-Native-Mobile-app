import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight } from '@/components/ui/icons';
import type {
  AssistantOrderCardBlock,
  AssistantOrderListBlock,
  AssistantOrderListItem,
  AssistantTexts,
} from '@/types/assistant.types';
import { selectAssistantOption } from '../../services/assistant-turn-flow';
import { useAssistantStore } from '../../store/use-assistant-store';
import { fillCount } from '../../utils/assistant-texts';
import {
  AssistantArrowCircle,
  AssistantBodyText,
  AssistantBubble,
  AssistantCard,
  AssistantMutedText,
  AssistantToneBadge,
} from '../assistant-surfaces';
import { AssistantOrderDetailLink } from './assistant-order-detail-link';
import { AssistantOrderProducts } from './assistant-order-products';

const ACCENT_BAR_WIDTH = 3;

type OrderSummaryFields = Pick<
  AssistantOrderListItem,
  'order_no' | 'date_label' | 'total_label' | 'status_text' | 'tone'
>;

function OrderSummary({ order }: { order: OrderSummaryFields }) {
  return (
    <YStack gap="$1">
      {/* Sipariş numarası hiç kısaltılmaz; dar ekranda durum rozeti alt satıra iner. */}
      <XStack alignItems="center" columnGap="$3" flexWrap="wrap" justifyContent="space-between" rowGap="$1.5">
        <Paragraph color="$color" fontSize={15} fontWeight="800">
          {order.order_no}
        </Paragraph>
        <AssistantToneBadge text={order.status_text} tone={order.tone} />
      </XStack>
      <AssistantMutedText>
        {[order.date_label, order.total_label].filter(Boolean).join(' · ')}
      </AssistantMutedText>
    </YStack>
  );
}

/** Tıklanabilir sipariş kartları → `select { id: select_id, payload }` (README §6.3). */
export function AssistantOrderList({
  block,
  restored,
}: {
  block: AssistantOrderListBlock;
  restored: boolean;
}) {
  const busy = useAssistantStore((state) => state.busy);

  if (block.items.length === 0) {
    return block.empty_text ? (
      <AssistantBubble>
        <AssistantBodyText>{block.empty_text}</AssistantBodyText>
      </AssistantBubble>
    ) : null;
  }

  const handlePress = (item: AssistantOrderListItem) => {
    if (restored || busy) return;
    void selectAssistantOption(item.select_id, item.payload, item.order_no);
  };

  return (
    <YStack gap="$2.5">
      {block.items.map((item) => (
        <AssistantCard
          accessibilityRole="button"
          accessibilityState={{ disabled: restored || busy }}
          key={item.select_id}
          onPress={() => handlePress(item)}
          opacity={restored ? 0.5 : 1}
          overflow="hidden"
          paddingLeft="$4"
          pressStyle={restored ? undefined : { backgroundColor: '$color2' }}
          testID={`assistant-order-${item.select_id}`}
        >
          {/* Web'deki turuncu kenar çizgisi: kartın tıklanabilir sipariş olduğunu belli eder. */}
          <YStack
            backgroundColor="$brand"
            borderBottomRightRadius={ACCENT_BAR_WIDTH}
            borderTopRightRadius={ACCENT_BAR_WIDTH}
            bottom="$3"
            left={0}
            position="absolute"
            top="$3"
            width={ACCENT_BAR_WIDTH}
          />
          <XStack alignItems="center" gap="$3">
            <YStack flex={1} gap="$1" minWidth={0}>
              <OrderSummary order={item} />
              {item.summary ? <AssistantBodyText fontSize={14}>{item.summary}</AssistantBodyText> : null}
              {item.note ? <AssistantMutedText>{item.note}</AssistantMutedText> : null}
              {item.products ? <AssistantOrderProducts compact products={item.products} /> : null}
            </YStack>
            <AssistantArrowCircle>
              <ChevronRight color="$brandTintText" size={16} />
            </AssistantArrowCircle>
          </XStack>
        </AssistantCard>
      ))}
    </YStack>
  );
}

/** Salt okunur sipariş özeti (README §6.4): telefon/adres/IBAN hiçbir blokta yoktur. */
export function AssistantOrderCard({
  block,
  texts,
}: {
  block: AssistantOrderCardBlock;
  texts: AssistantTexts;
}) {
  return (
    <AssistantCard>
      <OrderSummary order={block} />
      {block.lines.map((line, index) => (
        <XStack flexWrap="wrap" gap="$1" key={`${line.label}-${index}`}>
          <AssistantMutedText fontSize={14}>{line.label}:</AssistantMutedText>
          <Paragraph color="$color" fontSize={14} fontWeight="600" selectable>
            {line.value}
          </Paragraph>
        </XStack>
      ))}
      <AssistantOrderProducts products={block.items} />
      {block.more_count ? (
        <AssistantMutedText>{fillCount(texts.more_items, block.more_count)}</AssistantMutedText>
      ) : null}
      {block.detail ? <AssistantOrderDetailLink blockId={block.id} detail={block.detail} /> : null}
    </AssistantCard>
  );
}
