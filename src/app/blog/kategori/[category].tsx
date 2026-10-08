import { useLocalSearchParams } from 'expo-router';
import { BlogListingScreen } from '@/features/blog/screens/blog-listing-screen';

export default function BlogCategoryRoute() {
  const { category } = useLocalSearchParams<{ category: string }>();
  // Kategori değişince ekranın filtre durumu baştan kurulsun diye anahtar verilir.
  return <BlogListingScreen initialCategory={category} key={category} />;
}
