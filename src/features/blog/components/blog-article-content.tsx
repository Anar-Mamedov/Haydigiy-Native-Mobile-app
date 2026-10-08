import { Fragment } from 'react';
import { type ColorTokens, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogContentBlock, BlogHeadingLevel, BlogInline } from '../types/blog.types';
import { BlogContentImage } from './blog-content-image';

type TextMetrics = { fontSize: number; lineHeight: number };

// Web içerik stilleriyle (mobil kırılım) aynı ölçüler: gövde 16/1.75, başlıklar serif yerine kalın.
const BODY_TEXT: TextMetrics = { fontSize: 16, lineHeight: 28 };
const QUOTE_TEXT: TextMetrics = { fontSize: 21, lineHeight: 28 };
const HEADING_TEXT: Record<BlogHeadingLevel, TextMetrics> = {
  2: { fontSize: 26, lineHeight: 31 },
  3: { fontSize: 22, lineHeight: 27 },
  4: { fontSize: 19, lineHeight: 24 },
};

type BlogArticleContentProps = {
  blocks: BlogContentBlock[];
  onLinkPress: (href: string) => void;
};

type InlineRunsProps = TextMetrics & {
  /** Düz parçaların rengi; kalın parçalar başlık rengine, bağlantılar marka rengine geçer. */
  color: ColorTokens;
  /** Kalın olmayan parçaların ağırlığı; başlıkta tüm metin kalın kalsın diye verilir. */
  fontWeight?: '400' | '700';
  runs: BlogInline[];
  onLinkPress: (href: string) => void;
};

/**
 * Satır içi parçaları iç içe metin olarak basar. İç metinler boyutu kendi
 * taşır; Tamagui metinleri ebeveynden boyut devralmadığı için ölçüler açıkça verilir.
 */
function InlineRuns({ color, fontWeight = '400', runs, fontSize, lineHeight, onLinkPress }: InlineRunsProps) {
  return (
    <>
      {runs.map((run, index) => {
        const href = run.href;
        return (
          <Paragraph
            accessibilityRole={href ? 'link' : undefined}
            color={href ? '$brand' : run.bold ? '$color' : color}
            fontSize={fontSize}
            fontStyle={run.italic ? 'italic' : undefined}
            fontWeight={run.bold ? '700' : fontWeight}
            key={index}
            lineHeight={lineHeight}
            onPress={href ? () => onLinkPress(href) : undefined}
            textDecorationLine={href ? 'underline' : undefined}
          >
            {run.text}
          </Paragraph>
        );
      })}
    </>
  );
}

function ContentBlock({ block, onLinkPress }: { block: BlogContentBlock; onLinkPress: (href: string) => void }) {
  switch (block.type) {
    case 'heading': {
      const metrics = HEADING_TEXT[block.level];
      return (
        <Paragraph accessibilityRole="header" color="$color" fontWeight="700" letterSpacing={-0.5} marginTop="$3" {...metrics}>
          <InlineRuns color="$color" fontWeight="700" onLinkPress={onLinkPress} runs={block.children} {...metrics} />
        </Paragraph>
      );
    }
    case 'quote':
      return (
        <XStack borderLeftColor="$brand" borderLeftWidth={3} paddingLeft="$4" paddingVertical="$1">
          <Paragraph color="$color" flex={1} {...QUOTE_TEXT}>
            <InlineRuns color="$color" onLinkPress={onLinkPress} runs={block.children} {...QUOTE_TEXT} />
          </Paragraph>
        </XStack>
      );
    case 'list':
      return (
        <YStack gap="$2" paddingLeft="$1">
          {block.items.map((item, index) => (
            <XStack gap="$2" key={index}>
              <Paragraph color="$color11" minWidth={20} {...BODY_TEXT}>
                {block.ordered ? `${index + 1}.` : '•'}
              </Paragraph>
              <Paragraph color="$color11" flex={1} {...BODY_TEXT}>
                <InlineRuns color="$color11" onLinkPress={onLinkPress} runs={item} {...BODY_TEXT} />
              </Paragraph>
            </XStack>
          ))}
        </YStack>
      );
    case 'image':
      return <BlogContentImage alt={block.alt} src={block.src} />;
    case 'paragraph':
    default:
      return (
        <Paragraph color="$color11" {...BODY_TEXT}>
          <InlineRuns color="$color11" onLinkPress={onLinkPress} runs={block.children} {...BODY_TEXT} />
        </Paragraph>
      );
  }
}

/** Yazı gövdesi: güvenli HTML bloklarını tema renkleriyle yerel bileşenlere çevirir. */
export function BlogArticleContent({ blocks, onLinkPress }: BlogArticleContentProps) {
  if (blocks.length === 0) return null;

  return (
    <YStack gap="$4" testID="blog-article-content">
      {blocks.map((block, index) => (
        <Fragment key={`${block.type}-${index}`}>
          <ContentBlock block={block} onLinkPress={onLinkPress} />
        </Fragment>
      ))}
    </YStack>
  );
}
