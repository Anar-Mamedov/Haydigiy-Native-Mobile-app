import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogPostSummary } from '../types/blog.types';
import { BLOG_COVER_SCRIM_GRADIENT } from '../constants/blog-ui';
import { formatBlogDate } from '../utils/blog-date';
import { BlogImage } from './blog-image';

type BlogFeaturedPostCardProps = {
  post: BlogPostSummary;
  onPress: (post: BlogPostSummary) => void;
};

/**
 * Listenin manşet kartı: tam genişlik kapak, üstünde karartma ve ortalanmış
 * kategori, başlık, özet ve tarih (web `FeaturedPost`). Metin görselin üstünde
 * durduğu için iki temada da beyazdır.
 */
export function BlogFeaturedPostCard({ post, onPress }: BlogFeaturedPostCardProps) {
  const date = formatBlogDate(post.publishedAt);

  return (
    <Pressable
      accessibilityLabel={post.title}
      accessibilityRole="link"
      onPress={() => onPress(post)}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      testID={`blog-featured-${post.slug}`}
    >
      <YStack backgroundColor="$color4" position="relative">
        <BlogImage alt={post.coverImageAlt || post.title} aspectRatio={4 / 5} placeholderSize={64} uri={post.coverImage} />
        <LinearGradient
          colors={BLOG_COVER_SCRIM_GRADIENT}
          locations={[0, 0.45, 1]}
          style={{ bottom: 0, left: 0, pointerEvents: 'none', position: 'absolute', right: 0, top: 0 }}
        />
        <YStack
          alignItems="center"
          bottom={0}
          gap="$3"
          left={0}
          paddingHorizontal="$5"
          paddingVertical="$6"
          position="absolute"
          right={0}
        >
          <Paragraph color="white" fontSize={11} fontWeight="700" letterSpacing={2.6} textAlign="center" textTransform="uppercase">
            {post.categoryTitle || 'HaydiGiy'}
          </Paragraph>
          <Paragraph color="white" fontSize={32} fontWeight="700" letterSpacing={-0.6} lineHeight={34} textAlign="center">
            {post.title}
          </Paragraph>
          {post.excerpt ? (
            <Paragraph color="white" fontSize={15} lineHeight={22} numberOfLines={3} opacity={0.85} textAlign="center">
              {post.excerpt}
            </Paragraph>
          ) : null}
          <YStack backgroundColor="$brand" height={3} width={40} />
          {date ? (
            <Paragraph color="white" fontSize={11} fontWeight="600" letterSpacing={1.8} opacity={0.8} textTransform="uppercase">
              {date}
            </Paragraph>
          ) : null}
        </YStack>
      </YStack>
    </Pressable>
  );
}
