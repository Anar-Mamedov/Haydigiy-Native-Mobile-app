import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BLOG_TEXTS } from '../constants/blog-ui';

type BlogAnswerSummaryProps = {
  text: string;
};

/** Web'deki "Kısa Cevap" kutusu: sol marka çizgisi ve yazının özet cevabı. */
export function BlogAnswerSummary({ text }: BlogAnswerSummaryProps) {
  return (
    <YStack
      backgroundColor="$color2"
      borderLeftColor="$brand"
      borderLeftWidth={3}
      gap="$3"
      paddingHorizontal="$5"
      paddingVertical="$5"
      testID="blog-answer-summary"
    >
      <Paragraph accessibilityRole="header" color="$brand" fontSize={11} fontWeight="700" letterSpacing={2.2} textTransform="uppercase">
        {BLOG_TEXTS.answerSummaryTitle}
      </Paragraph>
      <Paragraph color="$color11" fontSize={16} lineHeight={27}>
        {text}
      </Paragraph>
    </YStack>
  );
}
