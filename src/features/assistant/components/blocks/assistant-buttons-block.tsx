import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import type { AssistantButtonItem, AssistantButtonsBlock as ButtonsBlock } from '@/types/assistant.types';
import { selectAssistantOption } from '../../services/assistant-turn-flow';
import { useAssistantStore } from '../../store/use-assistant-store';

type AssistantButtonsBlockProps = {
  block: ButtonsBlock;
  /** Geri yüklenen geçmişteki düğmeler etkisizdir (README §4.5). */
  restored: boolean;
};

const DIMMED_OPACITY = 0.5;

/** Seçenek düğmeleri: etiket AYNEN basılır, id/payload AYNEN geri gönderilir (kural 4). */
export function AssistantButtonsBlock({ block, restored }: AssistantButtonsBlockProps) {
  const busy = useAssistantStore((state) => state.busy);
  const isChips = block.layout === 'chips';

  const handlePress = (item: AssistantButtonItem) => {
    if (restored || busy || item.disabled) return;
    void selectAssistantOption(item.id, item.payload, item.label);
  };

  const Container = isChips ? XStack : YStack;

  return (
    <Container flexWrap={isChips ? 'wrap' : undefined} gap="$2">
      {block.items.map((item) => {
        const inactive = restored || busy || item.disabled;
        const dimmed = restored || item.disabled;
        return (
          <YStack
            accessibilityRole="button"
            accessibilityState={{ disabled: inactive }}
            alignItems={isChips ? 'center' : 'flex-start'}
            backgroundColor="$background"
            borderColor={isChips ? '$brand' : '$borderColor'}
            borderRadius={isChips ? '$10' : '$5'}
            borderWidth={1}
            justifyContent="center"
            key={item.id}
            minHeight={MIN_TOUCH_TARGET}
            onPress={() => handlePress(item)}
            opacity={dimmed ? DIMMED_OPACITY : 1}
            paddingHorizontal={isChips ? '$4' : '$3.5'}
            paddingVertical="$2"
            pressStyle={inactive ? undefined : { backgroundColor: '$color3' }}
            testID={`assistant-button-${item.id}`}
          >
            <Paragraph
              color={isChips ? '$brandTintText' : '$color'}
              fontSize={isChips ? 14 : 15}
              fontWeight={isChips ? '700' : '500'}
            >
              {item.label}
            </Paragraph>
          </YStack>
        );
      })}
    </Container>
  );
}
