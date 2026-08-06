import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AgreementSection } from '../data/agreement-content';

type AgreementSectionsProps = {
  sections: AgreementSection[];
};

/** Renders static legal sections (heading, definitions, paragraphs, bullets). */
export function AgreementSections({ sections }: AgreementSectionsProps) {
  return (
    <YStack gap="$4">
      {sections.map((section, sectionIndex) => (
        <YStack gap="$2" key={section.heading ?? `section-${sectionIndex}`}>
          {section.heading ? (
            <Paragraph color="$color" fontSize={15} fontWeight="800">
              {section.heading}
            </Paragraph>
          ) : null}

          {section.definitions?.map((definition) => (
            <Paragraph color="$color10" fontSize={13} key={definition.term} lineHeight={19}>
              <Paragraph color="$color" fontSize={13} fontWeight="700">
                {definition.term}:{' '}
              </Paragraph>
              {definition.desc}
            </Paragraph>
          ))}

          {section.paragraphs?.map((paragraph, index) => (
            <Paragraph color="$color10" fontSize={13} key={`p-${index}`} lineHeight={19}>
              {paragraph}
            </Paragraph>
          ))}

          {section.bullets?.map((bullet, index) => (
            <Paragraph color="$color10" fontSize={13} key={`b-${index}`} lineHeight={19} paddingLeft="$2">
              • {bullet}
            </Paragraph>
          ))}
        </YStack>
      ))}
    </YStack>
  );
}
