import { Paragraph, YStack } from 'tamagui';
import { AccordionSection } from '@/components/ui/accordion-section';
import { HelpArticle } from '@/types/help.types';
import { HelpFeedbackButton } from './help-feedback-button';

type HelpArticleItemProps = {
  article: HelpArticle;
  expanded: boolean;
  onToggle: () => void;
};

/** Accordion row for a single FAQ article: question, answer and "Faydalı" feedback. */
export function HelpArticleItem({ article, expanded, onToggle }: HelpArticleItemProps) {
  return (
    <AccordionSection expanded={expanded} onToggle={onToggle} title={article.question}>
      <YStack gap="$3">
        <Paragraph color="$color11" fontSize={13} lineHeight={19}>
          {article.answer}
        </Paragraph>
        <HelpFeedbackButton articleId={article.id} />
      </YStack>
    </AccordionSection>
  );
}
