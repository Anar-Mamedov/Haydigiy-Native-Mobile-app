import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { ChevronRight } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogPost } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';

type BlogArticleHeaderProps = {
  post: BlogPost;
  onBlogPress: () => void;
  onCategoryPress: (categorySlug: string) => void;
};

function Crumb({ label, onPress }: { label: string; onPress?: () => void }) {
  const text = (
    <Paragraph color="$color9" fontSize={11} fontWeight="600" letterSpacing={1.5} textTransform="uppercase">
      {label}
    </Paragraph>
  );

  if (!onPress) return text;
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="link" hitSlop={8} onPress={onPress}>
      {text}
    </Pressable>
  );
}

/**
 * Yazı başlığı (web `BlogArticle` header): içerik yolu, kategori, başlık ve özet.
 * Kategori kırıntısı yalnızca backend kategori slug'ı döndüğünde tıklanır (web ile aynı).
 */
export function BlogArticleHeader({ post, onBlogPress, onCategoryPress }: BlogArticleHeaderProps) {
  const categoryTitle = post.categoryTitle || BLOG_TEXTS.listingTitle;
  const categorySlug = post.categorySlug;

  return (
    <YStack alignItems="center" gap="$4" paddingHorizontal="$5" paddingTop="$6">
      <XStack accessibilityLabel="İçerik yolu" alignItems="center" flexWrap="wrap" gap="$1" justifyContent="center">
        <Crumb label={BLOG_TEXTS.listingTitle} onPress={onBlogPress} />
        <ChevronRight color="$color9" size={13} />
        <Crumb label={categoryTitle} onPress={categorySlug ? () => onCategoryPress(categorySlug) : undefined} />
      </XStack>
      <Paragraph color="$brand" fontSize={11} fontWeight="700" letterSpacing={2.7} textAlign="center" textTransform="uppercase">
        {categoryTitle}
      </Paragraph>
      <Paragraph accessibilityRole="header" color="$color" fontSize={36} fontWeight="700" letterSpacing={-1} lineHeight={39} textAlign="center">
        {post.title}
      </Paragraph>
      {post.excerpt ? (
        <Paragraph color="$color10" fontSize={17} lineHeight={27} textAlign="center">
          {post.excerpt}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
