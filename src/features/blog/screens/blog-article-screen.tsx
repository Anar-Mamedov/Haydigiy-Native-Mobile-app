import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, YStack } from 'tamagui';
import { FileText } from '@/components/ui/icons';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { useBlogPostQuery } from '../api/blog.queries';
import { BlogRelatedProduct } from '../types/blog.types';
import { BLOG_TEXTS } from '../constants/blog-ui';
import { buildBlogProductRoute } from '../utils/blog-product';
import { useBlogLinkPress } from '../hooks/use-blog-link-press';
import { BlogAnswerSummary } from '../components/blog-answer-summary';
import { BlogArticleContent } from '../components/blog-article-content';
import { BlogArticleHeader } from '../components/blog-article-header';
import { BlogFaqSection } from '../components/blog-faq-section';
import { BlogImage } from '../components/blog-image';
import { BlogProductStrip } from '../components/blog-product-strip';
import { BlogTagList } from '../components/blog-tag-list';

type BlogArticleScreenProps = {
  slug: string;
};

/** Blog yazısı (web `/blog/{slug}`): başlık, kapak, kısa cevap, ürünler, içerik, etiketler ve SSS. */
export function BlogArticleScreen({ slug }: BlogArticleScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useBlogPostQuery(slug);
  const handleLinkPress = useBlogLinkPress();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/blog');
  };

  // Listeye dönüşte yığında zaten varsa ona iner, yoksa listeyi açar.
  const goToBlog = () => router.dismissTo('/blog');
  const openCategory = (categorySlug: string) =>
    router.push({ pathname: '/blog/kategori/[category]', params: { category: categorySlug } });
  const openProduct = (product: BlogRelatedProduct) => router.push(buildBlogProductRoute(product));

  const header = <ScreenHeader onBack={handleBack} title={BLOG_TEXTS.listingTitle} />;

  if (query.isPending) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center" testID="blog-article-loading">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          {query.isError ? (
            <EmptyState
              actionLabel="Tekrar Dene"
              description="Blog yazısı yüklenirken bir hata oluştu."
              onActionPress={() => query.refetch()}
              primary
              title="Bir Hata Oluştu"
            />
          ) : (
            <EmptyState
              actionLabel="Blog'a Dön"
              description="Aradığınız yazı kaldırılmış ya da adresi değişmiş olabilir."
              icon={<FileText color="$brand" size={32} />}
              onActionPress={goToBlog}
              primary
              title="Blog yazısı bulunamadı"
            />
          )}
        </YStack>
      </AppScreen>
    );
  }

  const post = query.data;

  return (
    <AppScreen gap={0} header={header} padding={0}>
      <YStack gap="$6" paddingBottom={insets.bottom + 16} testID="blog-article">
        <BlogArticleHeader onBlogPress={goToBlog} onCategoryPress={openCategory} post={post} />

        {post.coverImage ? (
          <BlogImage
            alt={post.coverImageAlt || post.title}
            aspectRatio={1240 / 698}
            contentFit="contain"
            testID="blog-article-cover"
            uri={post.coverImage}
          />
        ) : null}

        <YStack gap="$6" paddingHorizontal="$4">
          {post.answerSummary ? <BlogAnswerSummary text={post.answerSummary} /> : null}
          <BlogProductStrip onProductPress={openProduct} products={post.relatedProducts} />
          <BlogArticleContent blocks={post.contentBlocks} onLinkPress={handleLinkPress} />
          <BlogTagList tags={post.tags} />
        </YStack>

        <BlogFaqSection faqs={post.faqs} />
      </YStack>
    </AppScreen>
  );
}
