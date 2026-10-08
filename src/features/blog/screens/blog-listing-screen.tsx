import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, YStack } from 'tamagui';
import { FileText } from '@/components/ui/icons';
import { AppButton, AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BlogPostSummary } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';
import { BlogFeedItem } from '../utils/blog-feed';
import { useBlogListing } from '../hooks/use-blog-listing';
import { BlogCategoryTabs } from '../components/blog-category-tabs';
import { BlogFeedCard } from '../components/blog-feed-card';
import { BlogListingHero } from '../components/blog-listing-hero';

type BlogListingScreenProps = {
  /** `/blog/kategori/{category}` rotasından gelen kategori; `/blog` için boş. */
  initialCategory?: string;
};

/** Blog yazı listesi (web `/blog` ve `/blog/kategori/{kategori}`). */
export function BlogListingScreen({ initialCategory }: BlogListingScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listing = useBlogListing(initialCategory);
  const { postsQuery } = listing;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const openPost = (post: BlogPostSummary) => {
    router.push({ pathname: '/blog/[slug]', params: { slug: post.slug } });
  };

  const renderEmpty = () => {
    if (postsQuery.isPending) {
      return (
        <YStack alignItems="center" justifyContent="center" paddingVertical="$8" testID="blog-listing-loading">
          <Spinner color="$brand" size="large" />
        </YStack>
      );
    }

    return (
      <YStack paddingHorizontal="$4">
        {postsQuery.isError ? (
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Blog yazıları yüklenirken bir hata oluştu."
            onActionPress={listing.refresh}
            primary
            title="Bir Hata Oluştu"
          />
        ) : (
          <EmptyState
            description={BLOG_TEXTS.emptyDescription}
            icon={<FileText color="$brand" size={32} />}
            title={BLOG_TEXTS.emptyTitle}
          />
        )}
      </YStack>
    );
  };

  const renderFooter = () => {
    if (postsQuery.isFetchingNextPage) {
      return (
        <YStack alignItems="center" paddingVertical="$4">
          <Spinner color="$brand" size="small" />
        </YStack>
      );
    }

    if (postsQuery.isFetchNextPageError) {
      return (
        <YStack alignItems="center" gap="$3" paddingHorizontal="$4" paddingVertical="$4">
          <Paragraph color="$color10" fontSize={13} textAlign="center">
            Daha fazla yazı yüklenemedi.
          </Paragraph>
          <AppButton onPress={() => postsQuery.fetchNextPage()} size="$3">
            Tekrar Dene
          </AppButton>
        </YStack>
      );
    }

    return null;
  };

  return (
    <AppScreen
      gap={0}
      header={<ScreenHeader onBack={handleBack} title={BLOG_TEXTS.listingTitle} />}
      padding={0}
      scrollable={false}
    >
      {listing.categories.length > 0 ? (
        <BlogCategoryTabs
          activeKey={listing.activeKey}
          categories={listing.categories}
          onSelect={listing.selectCategory}
        />
      ) : null}
      <FlashList
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        data={listing.items}
        getItemType={(item: BlogFeedItem) => item.kind}
        keyExtractor={(item: BlogFeedItem) => `${item.kind}-${item.post.id || item.post.slug}`}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <YStack paddingBottom="$6">
            <BlogListingHero title={listing.title} />
          </YStack>
        }
        onEndReached={listing.loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={listing.refresh}
        refreshing={postsQuery.isRefetching && !postsQuery.isFetchingNextPage}
        renderItem={({ item }: { item: BlogFeedItem }) => <BlogFeedCard item={item} onPress={openPost} />}
        showsVerticalScrollIndicator={false}
        testID="blog-listing"
      />
    </AppScreen>
  );
}
