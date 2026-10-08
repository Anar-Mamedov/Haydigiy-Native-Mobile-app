import { YStack } from 'tamagui';
import { BlogPostSummary } from '../types/blog.types';
import { BlogFeedItem } from '../utils/blog-feed';
import { BlogFeaturedPostCard } from './blog-featured-post-card';
import { BlogPostCard } from './blog-post-card';

type BlogFeedCardProps = {
  item: BlogFeedItem;
  onPress: (post: BlogPostSummary) => void;
};

/** Akış öğesini türüne göre manşet, kompakt veya standart karta çevirir. */
export function BlogFeedCard({ item, onPress }: BlogFeedCardProps) {
  return (
    <YStack paddingBottom="$7" paddingHorizontal="$4">
      {item.kind === 'featured' ? (
        <BlogFeaturedPostCard onPress={onPress} post={item.post} />
      ) : (
        <BlogPostCard onPress={onPress} post={item.post} variant={item.kind} />
      )}
    </YStack>
  );
}
