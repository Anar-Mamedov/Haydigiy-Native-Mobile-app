import { useEffect, useRef, useState } from 'react';
import { ThumbsUp } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useHelpFeedbackMutation } from '../api/help.mutations';

const ERROR_RESET_MS = 3000;

type FeedbackStatus = 'idle' | 'loading' | 'success' | 'error';

type HelpFeedbackButtonProps = {
  articleId: number;
};

/** "Faydalı" feedback button for a help article (`POST /help/feedback`). */
export function HelpFeedbackButton({ articleId }: HelpFeedbackButtonProps) {
  const feedback = useHelpFeedbackMutation();
  const [status, setStatus] = useState<FeedbackStatus>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const disabled = status === 'loading' || status === 'success';

  const handlePress = async () => {
    if (disabled) return;
    setStatus('loading');
    try {
      await feedback.mutateAsync(articleId);
      setStatus('success');
    } catch {
      setStatus('error');
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setStatus('idle'), ERROR_RESET_MS);
    }
  };

  const label =
    status === 'success' ? 'Teşekkürler' : status === 'loading' ? 'Gönderiliyor...' : 'Faydalı';

  return (
    <YStack gap="$1.5">
      <XStack justifyContent="flex-end">
        <XStack
          accessibilityLabel="Bu içerik faydalı"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          alignItems="center"
          borderColor="$brand"
          borderRadius="$3"
          borderWidth={1}
          gap="$1.5"
          height={32}
          onPress={handlePress}
          opacity={disabled ? 0.6 : 1}
          paddingHorizontal="$3"
          pressStyle={disabled ? undefined : { opacity: 0.7 }}
        >
          {status === 'idle' ? <ThumbsUp color="$brand" size={14} /> : null}
          <Paragraph color="$brand" fontSize={12} fontWeight="700">
            {label}
          </Paragraph>
        </XStack>
      </XStack>
      {status === 'error' ? (
        <Paragraph color="$red10" fontSize={12} textAlign="right">
          Gönderilemedi. Lütfen tekrar deneyin.
        </Paragraph>
      ) : null}
    </YStack>
  );
}
