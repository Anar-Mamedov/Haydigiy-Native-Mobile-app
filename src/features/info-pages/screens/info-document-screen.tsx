import { type Href, Redirect, useRouter } from 'expo-router';
import { AppScreen, ScreenHeader } from '@/components/ui';
import { SectionCard } from '@/components/ui/section-card';
import { AgreementContent } from '@/features/agreements/components/agreement-content';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { handleLinkPress } from '@/utils/link-handler';
import { findInfoDocument } from '../data/info-documents';

type InfoDocumentScreenProps = {
  slug: string | undefined;
};

const HOME_ROUTE = '/' as Href;

/**
 * Hakkımızda, İşlem Rehberi, İptal-İade Koşulları ve sözleşme metinleri gibi
 * statik bilgi sayfaları (web `LegalPageLayout`). İçerik derlemeyle gelir; uzak
 * veri yoktur. Tanınmayan slug 404 ekranına gider. Metin içi bağlantılar web
 * yolunu taşır ve banner bağlantılarıyla aynı eşlemeden geçer.
 */
export function InfoDocumentScreen({ slug }: InfoDocumentScreenProps) {
  const router = useRouter();
  const document = findInfoDocument(slug);

  if (!document) {
    return <Redirect href={NOT_FOUND_ROUTE} />;
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(HOME_ROUTE);
    }
  };

  return (
    <AppScreen header={<ScreenHeader onBack={handleBack} title={document.title} />}>
      <SectionCard>
        <AgreementContent blocks={document.blocks} onLinkPress={handleLinkPress} />
      </SectionCard>
    </AppScreen>
  );
}
