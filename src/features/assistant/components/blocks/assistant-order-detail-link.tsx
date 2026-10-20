import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { ArrowUpRight } from '@/components/ui/icons';
import type { AssistantOrderDetailLink as OrderDetailLink } from '@/types/assistant.types';
import { useAssistantLinkPress } from '../../hooks/use-assistant-link-press';

/** Ölçüm olayındaki `kind`: sunucu sipariş sayfası bağlantısı için "siparis" bekler. */
const ORDER_DETAIL_KIND = 'siparis';

/**
 * order_card içindeki sipariş sayfası bağlantısı. Kartın kendisi dokunulmaz, yalnız bu bağlantı.
 * Dokunuş link_button'la aynı yoldan geçer (README §7.1); `block_id` kartın id'sidir.
 * Etiket ve adres sunucudan geldiği gibi kullanılır.
 */
export function AssistantOrderDetailLink({ blockId, detail }: { blockId: string; detail: OrderDetailLink }) {
  const onPress = useAssistantLinkPress();

  return (
    <XStack borderTopColor="$borderColor" borderTopWidth={1} justifyContent="flex-end">
      <XStack
        accessibilityLabel={detail.label}
        accessibilityRole="link"
        alignItems="center"
        gap="$1"
        minHeight={MIN_TOUCH_TARGET}
        onPress={() => onPress({ id: blockId, kind: ORDER_DETAIL_KIND, href: detail.href })}
        pressStyle={{ opacity: 0.6 }}
        testID={`assistant-order-detail-${blockId}`}
      >
        <Paragraph color="$brandTintText" fontSize={14} fontWeight="700">
          {detail.label}
        </Paragraph>
        <ArrowUpRight color="$brandTintText" size={16} />
      </XStack>
    </XStack>
  );
}
