import { useLocalSearchParams } from 'expo-router';
import { BlogArticleScreen } from '@/features/blog/screens/blog-article-screen';

export default function BlogArticleRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <BlogArticleScreen slug={typeof slug === 'string' ? slug : ''} />;
}
