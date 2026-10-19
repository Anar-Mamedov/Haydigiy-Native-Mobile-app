import { XStack, YStack } from 'tamagui';
import { CopyField } from '@/components/ui/copy-field';
import type { AssistantTexts, AssistantTimelineBlock as TimelineBlock } from '@/types/assistant.types';
import { AssistantBodyText, AssistantCard, AssistantMutedText } from '../assistant-surfaces';

const DOT_SIZE = 12;

/** Kargo zaman çizelgesi: sunucunun verdiği sıra AYNEN (eski → yeni), yeniden sıralanmaz (README §6.5). */
export function AssistantTimelineBlock({ block, texts }: { block: TimelineBlock; texts: AssistantTexts }) {
  return (
    <AssistantCard gap="$3">
      {block.title ? <AssistantBodyText fontWeight="700">{block.title}</AssistantBodyText> : null}
      {block.carrier ? <AssistantBodyText fontWeight="600">{block.carrier}</AssistantBodyText> : null}
      {block.tracking_no ? (
        <CopyField
          accessibilityLabel={texts.copy_number}
          label={texts.tracking_label}
          value={block.tracking_no}
        />
      ) : null}
      <YStack>
        {block.events.map((event, index) => {
          const current = event.state === 'current';
          const last = index === block.events.length - 1;
          return (
            <XStack gap="$3" key={`${event.at_label}-${index}`}>
              <YStack alignItems="center" width={DOT_SIZE}>
                <YStack
                  backgroundColor={current ? '$brand' : '$color7'}
                  borderRadius={DOT_SIZE / 2}
                  height={DOT_SIZE}
                  marginTop="$1"
                  width={DOT_SIZE}
                />
                {last ? null : <YStack backgroundColor="$borderColor" flex={1} width={2} />}
              </YStack>
              <YStack flex={1} gap="$0.5" paddingBottom={last ? 0 : '$3'}>
                <AssistantBodyText fontSize={14} fontWeight={current ? '700' : '400'}>
                  {event.text}
                </AssistantBodyText>
                {event.at_label ? <AssistantMutedText>{event.at_label}</AssistantMutedText> : null}
              </YStack>
            </XStack>
          );
        })}
      </YStack>
      {block.note ? <AssistantMutedText>{block.note}</AssistantMutedText> : null}
    </AssistantCard>
  );
}
