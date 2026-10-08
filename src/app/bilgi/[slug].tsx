import { useLocalSearchParams } from 'expo-router';
import { InfoDocumentScreen } from '@/features/info-pages/screens/info-document-screen';

/** `/bilgi/{slug}` — web'deki aynı slug'lı bilgi/sözleşme sayfası. */
export default function InfoDocumentRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();

  return <InfoDocumentScreen slug={typeof slug === 'string' ? slug : undefined} />;
}
