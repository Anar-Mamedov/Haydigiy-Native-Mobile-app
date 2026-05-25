import { Paragraph, YStack } from 'tamagui';
import { HeadingContent } from '@/types/page-design.types';

type HomeHeadingSectionProps = {
  content: HeadingContent;
};

export function HomeHeadingSection({ content }: HomeHeadingSectionProps) {
  if (!content.text) {
    return null;
  }

  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$3" width="100%">
      <Paragraph fontSize="$6" fontWeight="800" letterSpacing={0.2} textAlign="center">
        {content.text}
      </Paragraph>
    </YStack>
  );
}
