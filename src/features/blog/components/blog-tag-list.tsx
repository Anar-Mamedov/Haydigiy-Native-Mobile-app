import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type BlogTagListProps = {
  tags: string[];
};

/** Yazının etiketleri (web: içeriğin altında çizgiyle ayrılan rozetler). */
export function BlogTagList({ tags }: BlogTagListProps) {
  if (tags.length === 0) return null;

  return (
    <XStack borderTopColor="$borderColor" borderTopWidth={1} flexWrap="wrap" gap="$2" paddingTop="$5">
      {tags.map((tag) => (
        <XStack backgroundColor="$color3" key={tag} paddingHorizontal="$3" paddingVertical="$1.5">
          <Paragraph color="$color10" fontSize={10} fontWeight="700" letterSpacing={1.3} textTransform="uppercase">
            {tag}
          </Paragraph>
        </XStack>
      ))}
    </XStack>
  );
}
