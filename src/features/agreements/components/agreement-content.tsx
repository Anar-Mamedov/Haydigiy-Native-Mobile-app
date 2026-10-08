import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight } from '@/components/ui/icons';
import { AgreementBlock } from '../data/agreement.types';

type AgreementContentProps = {
  blocks: AgreementBlock[];
  /**
   * Called with a `link` block's `href`. Without it link blocks render as plain
   * text, so hosts that cannot navigate never show a dead control.
   */
  onLinkPress?: (href: string) => void;
};

/** Renders an agreement's content blocks (paragraphs, headings, terms, bullets, links). */
export function AgreementContent({ blocks, onLinkPress }: AgreementContentProps) {
  return (
    <YStack gap="$3">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <Paragraph
                color="$color"
                fontSize={15}
                fontWeight="800"
                key={index}
                marginTop={index === 0 ? 0 : '$2'}
              >
                {block.text}
              </Paragraph>
            );
          case 'subheading':
            return (
              <Paragraph color="$color" fontSize={14} fontWeight="700" key={index} marginTop="$1">
                {block.text}
              </Paragraph>
            );
          case 'term':
            return (
              <YStack gap="$0.5" key={index}>
                <Paragraph color="$color" fontSize={13} fontWeight="700">
                  {block.term}
                </Paragraph>
                <Paragraph color="$color11" fontSize={13} lineHeight={19}>
                  {block.text}
                </Paragraph>
              </YStack>
            );
          case 'bullet':
            return (
              <XStack gap="$2" key={index} paddingLeft="$2">
                <Paragraph color="$color11" fontSize={13} lineHeight={19}>
                  {'•'}
                </Paragraph>
                <Paragraph color="$color11" flex={1} fontSize={13} lineHeight={19}>
                  {block.lead ? (
                    <Paragraph color="$color" fontSize={13} fontWeight="700" lineHeight={19}>
                      {block.lead}{' '}
                    </Paragraph>
                  ) : null}
                  {block.text}
                </Paragraph>
              </XStack>
            );
          case 'link':
            return onLinkPress ? (
              <Pressable
                accessibilityLabel={block.text}
                accessibilityRole="link"
                hitSlop={6}
                key={index}
                onPress={() => onLinkPress(block.href)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <XStack alignItems="center" gap="$1">
                  <Paragraph color="$brand" flexShrink={1} fontSize={13} fontWeight="700" lineHeight={19}>
                    {block.text}
                  </Paragraph>
                  <ChevronRight color="$brand" size={14} />
                </XStack>
              </Pressable>
            ) : (
              <Paragraph color="$color11" fontSize={13} key={index} lineHeight={19}>
                {block.text}
              </Paragraph>
            );
          case 'paragraph':
          default:
            return (
              <Paragraph color="$color11" fontSize={13} key={index} lineHeight={19}>
                {block.text}
              </Paragraph>
            );
        }
      })}
    </YStack>
  );
}
