import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ArrowUpRight } from '@/components/ui/icons';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import type { AssistantButtonItem, AssistantButtonsBlock as ButtonsBlock } from '@/types/assistant.types';
import { selectAssistantOption } from '../../services/assistant-turn-flow';
import { useAssistantStore } from '../../store/use-assistant-store';
import { splitLeadingEmoji } from '../../utils/assistant-label-emoji';
import { AssistantArrowCircle, AssistantIconTile } from '../assistant-surfaces';

type AssistantButtonsBlockProps = {
  block: ButtonsBlock;
  /** Geri yüklenen geçmişteki düğmeler etkisizdir (README §4.5). */
  restored: boolean;
};

const DIMMED_OPACITY = 0.5;
const LIST_BUTTON_MIN_HEIGHT = 54;

/** Liste düğmesi: baştaki emoji simge kutusuna alınır, sağda ok halkası (web `0aae36636`). */
function ListButtonContent({ label }: { label: string }) {
  const { icon, text } = splitLeadingEmoji(label);
  return (
    <XStack alignItems="center" gap="$3">
      {icon ? (
        <AssistantIconTile>
          <Paragraph fontSize={16} lineHeight={20}>
            {icon}
          </Paragraph>
        </AssistantIconTile>
      ) : null}
      <Paragraph color="$color" flex={1} fontSize={14} fontWeight="700">
        {text}
      </Paragraph>
      <AssistantArrowCircle>
        <ArrowUpRight color="$brandTintText" size={16} />
      </AssistantArrowCircle>
    </XStack>
  );
}

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
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: inactive }}
            alignItems={isChips ? 'center' : 'stretch'}
            backgroundColor={isChips ? '$assistantAccentTint' : '$background'}
            borderColor="$assistantAccentTintBorder"
            borderRadius={isChips ? '$10' : '$6'}
            borderWidth={1}
            justifyContent="center"
            key={item.id}
            minHeight={isChips ? MIN_TOUCH_TARGET : LIST_BUTTON_MIN_HEIGHT}
            onPress={() => handlePress(item)}
            opacity={dimmed ? DIMMED_OPACITY : 1}
            paddingHorizontal={isChips ? '$4' : '$3'}
            paddingVertical="$2"
            pressStyle={inactive ? undefined : { backgroundColor: '$color3' }}
            testID={`assistant-button-${item.id}`}
          >
            {isChips ? (
              <Paragraph color="$brandTintText" fontSize={13} fontWeight="700">
                {item.label}
              </Paragraph>
            ) : (
              <ListButtonContent label={item.label} />
            )}
          </YStack>
        );
      })}
    </Container>
  );
}
