import { styled, YStack, type ColorTokens } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import type { AssistantTone } from '@/types/assistant.types';

/**
 * Sohbetin ortak yüzeyleri. Renkler tema token'larıdır; açık/koyu temada okunur kalır.
 * Metin her zaman düz metindir (markdown/HTML çözümlenmez, README §2 kural 2).
 */
export const AssistantBubble = styled(YStack, {
  name: 'AssistantBubble',
  alignSelf: 'flex-start',
  backgroundColor: '$color2',
  borderColor: '$borderColor',
  borderRadius: '$6',
  borderBottomLeftRadius: '$2',
  borderWidth: 1,
  maxWidth: '100%',
  paddingHorizontal: '$3.5',
  paddingVertical: '$2.5',
});

export const UserBubble = styled(YStack, {
  name: 'AssistantUserBubble',
  alignSelf: 'flex-end',
  backgroundColor: '$assistantUserBubble',
  borderColor: '$assistantUserBubbleBorder',
  borderRadius: '$6',
  borderBottomRightRadius: '$2',
  borderWidth: 1,
  maxWidth: '100%',
  paddingHorizontal: '$3.5',
  paddingVertical: '$2.5',
});

export const AssistantCard = styled(YStack, {
  name: 'AssistantCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderRadius: '$6',
  borderWidth: 1,
  gap: '$2',
  padding: '$3.5',
});

export const AssistantBodyText = styled(Paragraph, {
  name: 'AssistantBodyText',
  color: '$color',
  fontSize: 15,
  lineHeight: 22,
});

export const AssistantMutedText = styled(Paragraph, {
  name: 'AssistantMutedText',
  color: '$color11',
  fontSize: 13,
  lineHeight: 18,
});

const TONE_COLORS: Record<AssistantTone, { background: ColorTokens; color: ColorTokens }> = {
  info: { background: '$blue3', color: '$blue11' },
  success: { background: '$green3', color: '$green11' },
  warning: { background: '$yellow3', color: '$yellow11' },
  danger: { background: '$red3', color: '$red11' },
  neutral: { background: '$color3', color: '$color11' },
};

/** Durum rozeti: metin sunucudan hazır gelir (emojili `status_text`); renk yalnız destekleyicidir. */
export function AssistantToneBadge({ tone, text }: { tone: AssistantTone; text: string }) {
  if (!text) return null;
  const colors = TONE_COLORS[tone] ?? TONE_COLORS.neutral;
  return (
    <YStack
      backgroundColor={colors.background}
      borderRadius="$10"
      paddingHorizontal="$2.5"
      paddingVertical="$1"
    >
      <Paragraph color={colors.color} fontSize={12} fontWeight="700">
        {text}
      </Paragraph>
    </YStack>
  );
}
