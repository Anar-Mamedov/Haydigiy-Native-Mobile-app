import { memo } from 'react';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import type { AssistantBlock, AssistantMessage, AssistantTexts } from '@/types/assistant.types';
import { retrySessionStart } from '../services/assistant-session-flow';
import { retryAssistantMessage } from '../services/assistant-turn-flow';
import { useAssistantStore } from '../store/use-assistant-store';
import { AssistantBodyText, AssistantBubble, UserBubble } from './assistant-surfaces';
import { AssistantButtonsBlock } from './blocks/assistant-buttons-block';
import { AssistantLinkButton } from './blocks/assistant-link-button';
import { AssistantLiveSupport } from './blocks/assistant-live-support';
import { AssistantImage, AssistantVideo } from './blocks/assistant-media-blocks';
import { AssistantOrderCard, AssistantOrderList } from './blocks/assistant-order-blocks';
import { AssistantTimelineBlock } from './blocks/assistant-timeline-block';

type BlockViewProps = { block: AssistantBlock; restored: boolean; texts: AssistantTexts };

/** Bilinmeyen tür buraya hiç ulaşmaz (eşleme aşamasında atlanır, kural 3). */
function AssistantBlockView({ block, restored, texts }: BlockViewProps) {
  switch (block.type) {
    case 'text':
      return (
        <AssistantBubble>
          <AssistantBodyText selectable>{block.text}</AssistantBodyText>
        </AssistantBubble>
      );
    case 'buttons':
      return <AssistantButtonsBlock block={block} restored={restored} />;
    case 'order_list':
      return <AssistantOrderList block={block} restored={restored} />;
    case 'order_card':
      return <AssistantOrderCard block={block} texts={texts} />;
    case 'timeline':
      return <AssistantTimelineBlock block={block} texts={texts} />;
    case 'link_button':
      return <AssistantLinkButton block={block} />;
    case 'live_support':
      return (
        <AssistantLiveSupport
          blockId={block.id}
          copyText={block.copy_text}
          hint={block.hint}
          href={block.href}
          label={block.label}
          numberLabel={block.number_label}
          texts={texts}
        />
      );
    case 'image':
      return <AssistantImage block={block} texts={texts} />;
    case 'video':
      return <AssistantVideo block={block} texts={texts} />;
    default:
      return null;
  }
}

function RetryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const busy = useAssistantStore((state) => state.busy);
  return (
    <YStack
      accessibilityRole="button"
      accessibilityState={{ disabled: busy }}
      justifyContent="center"
      minHeight={MIN_TOUCH_TARGET}
      onPress={busy ? undefined : onPress}
    >
      <Paragraph color="$brandTintText" fontSize={13} fontWeight="700" textDecorationLine="underline">
        {label}
      </Paragraph>
    </YStack>
  );
}

type UserMessage = Extract<AssistantMessage, { role: 'user' }>;
type BotMessage = Extract<AssistantMessage, { role: 'assistant' }>;

function UserItem({ message, texts }: { message: UserMessage; texts: AssistantTexts }) {
  return (
    <YStack alignItems="flex-end" alignSelf="flex-end" gap="$1" maxWidth="85%">
      <UserBubble opacity={message.status === 'pending' ? 0.7 : 1}>
        <AssistantBodyText>{message.text}</AssistantBodyText>
      </UserBubble>
      {message.status === 'failed' ? (
        <XStack alignItems="center" gap="$1.5">
          <Paragraph color="$red11" fontSize={12}>
            {texts.send_failed} ·
          </Paragraph>
          <RetryButton label={texts.retry} onPress={() => void retryAssistantMessage(message.key)} />
        </XStack>
      ) : null}
    </YStack>
  );
}

function BotItem({ message, texts }: { message: BotMessage; texts: AssistantTexts }) {
  const live = useAssistantStore((state) => state.config?.fallback.live_support);
  return (
    <YStack alignSelf="flex-start" gap="$2" maxWidth="94%" width="100%">
      {message.blocks.map((block) => (
        <AssistantBlockView block={block} key={block.id} restored={message.restored} texts={texts} />
      ))}
      {message.fallback ? (
        <YStack gap="$2">
          {message.fallback.text ? (
            <AssistantBubble>
              <AssistantBodyText>{message.fallback.text}</AssistantBodyText>
            </AssistantBubble>
          ) : null}
          {live ? (
            <AssistantLiveSupport
              href={live.href}
              label={live.label}
              numberLabel={live.number_label}
              texts={texts}
            />
          ) : null}
          {message.fallback.retrySession ? (
            <RetryButton label={texts.retry} onPress={() => void retrySessionStart()} />
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}

export const AssistantMessageItem = memo(function AssistantMessageItem({
  message,
  texts,
}: {
  message: AssistantMessage;
  texts: AssistantTexts;
}) {
  return message.role === 'user' ? (
    <UserItem message={message} texts={texts} />
  ) : (
    <BotItem message={message} texts={texts} />
  );
});
