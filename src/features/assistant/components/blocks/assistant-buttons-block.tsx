import { useTheme, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ArrowUpRight } from '@/components/ui/icons';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { WhatsappIcon } from '@/components/ui/whatsapp-icon';
import type { AssistantButtonItem, AssistantButtonsBlock as ButtonsBlock } from '@/types/assistant.types';
import { selectAssistantOption } from '../../services/assistant-turn-flow';
import { openAssistantWhatsapp } from '../../services/assistant-whatsapp-link';
import { useAssistantStore } from '../../store/use-assistant-store';
import { resolveAssistantButtonState } from '../../utils/assistant-button-state';
import { splitLeadingEmoji } from '../../utils/assistant-label-emoji';
import { AssistantArrowCircle, AssistantIconTile } from '../assistant-surfaces';

type AssistantButtonsBlockProps = {
  block: ButtonsBlock;
  /** Geri yüklenen geçmişteki seçim düğmeleri etkisizdir (README §4.5). */
  restored: boolean;
};

type ButtonContentProps = {
  item: AssistantButtonItem;
  testID: string;
};

const DIMMED_OPACITY = 0.5;
const LIST_BUTTON_MIN_HEIGHT = 54;
const LIST_WHATSAPP_ICON_SIZE = 18;
const CHIP_WHATSAPP_ICON_SIZE = 16;

/**
 * Liste düğmesi: baştaki emoji simge kutusuna alınır, sağda ok halkası (web `0aae36636`).
 * `icon: 'whatsapp'` ise kutu yeşil WhatsApp logosudur ve emoji kutusu çizilmez (web `c25e8d8e0`).
 */
function ListButtonContent({ item, testID }: ButtonContentProps) {
  const { icon, text } = splitLeadingEmoji(item.label);
  return (
    <XStack alignItems="center" gap="$3">
      {item.icon === 'whatsapp' ? (
        <AssistantIconTile testID={`${testID}-whatsapp-icon`} whatsapp>
          <WhatsappIcon color="white" size={LIST_WHATSAPP_ICON_SIZE} />
        </AssistantIconTile>
      ) : icon ? (
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

/** Çip düğmesi: etiket aynen basılır; `icon: 'whatsapp'` ise solunda küçük yeşil logo (web `c25e8d8e0`). */
function ChipButtonContent({ item, testID }: ButtonContentProps) {
  const theme = useTheme();
  return (
    <XStack alignItems="center" gap="$1.5">
      {item.icon === 'whatsapp' ? (
        <YStack testID={`${testID}-whatsapp-icon`}>
          <WhatsappIcon color={theme.assistantLiveSupport.val} size={CHIP_WHATSAPP_ICON_SIZE} />
        </YStack>
      ) : null}
      <Paragraph color="$brandTintText" fontSize={13} fontWeight="700">
        {item.label}
      </Paragraph>
    </XStack>
  );
}

/**
 * Seçenek düğmeleri: etiket AYNEN basılır, id/payload AYNEN geri gönderilir (kural 4).
 * wa.me adresi taşıyan düğme (WhatsApp kategorisi) seçim göndermez, WhatsApp'ı doğrudan açar.
 */
export function AssistantButtonsBlock({ block, restored }: AssistantButtonsBlockProps) {
  const busy = useAssistantStore((state) => state.busy);
  const isChips = block.layout === 'chips';

  const handlePress = (item: AssistantButtonItem) => {
    const state = resolveAssistantButtonState(item, { busy, restored });
    if (state.inactive) return;
    if (state.action === 'link' && item.href) {
      openAssistantWhatsapp(item.href, { blockId: block.id, kind: 'whatsapp' });
      return;
    }
    void selectAssistantOption(item.id, item.payload, item.label);
  };

  const Container = isChips ? XStack : YStack;

  return (
    <Container flexWrap={isChips ? 'wrap' : undefined} gap="$2">
      {block.items.map((item) => {
        const state = resolveAssistantButtonState(item, { busy, restored });
        const testID = `assistant-button-${item.id}`;
        return (
          <YStack
            accessibilityLabel={item.label}
            accessibilityRole={state.action === 'link' ? 'link' : 'button'}
            accessibilityState={{ disabled: state.inactive }}
            alignItems={isChips ? 'center' : 'stretch'}
            backgroundColor={isChips ? '$assistantAccentTint' : '$background'}
            borderColor="$assistantAccentTintBorder"
            borderRadius={isChips ? '$10' : '$6'}
            borderWidth={1}
            justifyContent="center"
            key={item.id}
            minHeight={isChips ? MIN_TOUCH_TARGET : LIST_BUTTON_MIN_HEIGHT}
            onPress={() => handlePress(item)}
            opacity={state.dimmed ? DIMMED_OPACITY : 1}
            paddingHorizontal={isChips ? '$4' : '$3'}
            paddingVertical="$2"
            pressStyle={state.inactive ? undefined : { backgroundColor: '$color3' }}
            testID={testID}
          >
            {isChips ? (
              <ChipButtonContent item={item} testID={testID} />
            ) : (
              <ListButtonContent item={item} testID={testID} />
            )}
          </YStack>
        );
      })}
    </Container>
  );
}
