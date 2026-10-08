import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { ChevronRight } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogPostSummary } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';
import { formatBlogDate } from '../utils/blog-date';
import { BlogImage } from './blog-image';

export type BlogPostCardVariant = 'compact' | 'standard';

type BlogPostCardProps = {
  post: BlogPostSummary;
  variant: BlogPostCardVariant;
  onPress: (post: BlogPostSummary) => void;
};

function CategoryLabel({ title }: { title: string }) {
  return (
    <Paragraph color="$color10" fontSize={10} fontWeight="700" letterSpacing={1.9} textTransform="uppercase">
      {title}
    </Paragraph>
  );
}

/**
 * Manşet dışındaki yazı kartları (web `CompactPost` / `StandardPost`):
 * - `compact`: dikey kapak, altına taşan kutuda kategori, başlık ve tarih,
 * - `standard`: üst çizgili, yatay kapak, özet ve "Yazıyı oku" çağrısı.
 */
export function BlogPostCard({ post, variant, onPress }: BlogPostCardProps) {
  const category = post.categoryTitle || 'HaydiGiy';
  const alt = post.coverImageAlt || post.title;
  const date = formatBlogDate(post.publishedAt);

  return (
    <Pressable
      accessibilityLabel={post.title}
      accessibilityRole="link"
      onPress={() => onPress(post)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      testID={`blog-${variant}-${post.slug}`}
    >
      {variant === 'compact' ? (
        <YStack>
          <BlogImage alt={alt} aspectRatio={4 / 5} uri={post.coverImage} />
          <YStack
            backgroundColor="$background"
            gap="$2"
            marginLeft="$4"
            marginTop={-36}
            paddingBottom="$2"
            paddingHorizontal="$4"
            paddingTop="$4"
          >
            <CategoryLabel title={category} />
            <Paragraph color="$color" fontSize={24} fontWeight="700" letterSpacing={-0.4} lineHeight={27}>
              {post.title}
            </Paragraph>
            <YStack backgroundColor="$brand" height={3} marginTop="$1" width={32} />
            {date ? (
              <Paragraph color="$color9" fontSize={10} fontWeight="600" letterSpacing={1.3} textTransform="uppercase">
                {date}
              </Paragraph>
            ) : null}
          </YStack>
        </YStack>
      ) : (
        <YStack borderColor="$borderColor" borderTopWidth={1} gap="$2" paddingTop="$5">
          <BlogImage alt={alt} aspectRatio={4 / 3} uri={post.coverImage} />
          <YStack gap="$2" paddingTop="$3">
            <CategoryLabel title={category} />
            <Paragraph color="$color" fontSize={26} fontWeight="700" letterSpacing={-0.4} lineHeight={30}>
              {post.title}
            </Paragraph>
            {post.excerpt ? (
              <Paragraph color="$color10" fontSize={14} lineHeight={22} numberOfLines={2}>
                {post.excerpt}
              </Paragraph>
            ) : null}
            <XStack alignItems="center" gap="$1.5" paddingTop="$2">
              <Paragraph color="$color" fontSize={11} fontWeight="700" letterSpacing={1.6} textTransform="uppercase">
                {BLOG_TEXTS.readMore}
              </Paragraph>
              <ChevronRight color="$color" size={15} />
            </XStack>
          </YStack>
        </YStack>
      )}
    </Pressable>
  );
}
