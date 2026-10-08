import { useState } from 'react';
import { YStack } from 'tamagui';
import { AccordionSection } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogFaq } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';

type BlogFaqSectionProps = {
  faqs: BlogFaq[];
};

/** Yazının sık sorulan soruları; web'deki `<details>` listesi gibi her soru ayrı açılır. */
export function BlogFaqSection({ faqs }: BlogFaqSectionProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  if (faqs.length === 0) return null;

  const toggle = (index: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <YStack backgroundColor="$color2" gap="$4" paddingHorizontal="$4" paddingVertical="$8" testID="blog-faq-section">
      <YStack gap="$2">
        <Paragraph color="$brand" fontSize={10} fontWeight="700" letterSpacing={2.5} textTransform="uppercase">
          {BLOG_TEXTS.faqEyebrow}
        </Paragraph>
        <Paragraph accessibilityRole="header" color="$color" fontSize={32} fontWeight="700" letterSpacing={-0.8} lineHeight={35}>
          {BLOG_TEXTS.faqTitle}
        </Paragraph>
      </YStack>
      <YStack gap="$3">
        {faqs.map((faq, index) => (
          <AccordionSection
            expanded={expanded.has(index)}
            key={`${faq.question}-${index}`}
            onToggle={() => toggle(index)}
            title={faq.question}
          >
            <Paragraph color="$color10" fontSize={15} lineHeight={25}>
              {faq.answer}
            </Paragraph>
          </AccordionSection>
        ))}
      </YStack>
    </YStack>
  );
}
