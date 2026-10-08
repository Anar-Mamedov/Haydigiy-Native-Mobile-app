import { COOKIE_POLICY } from '@/features/agreements/data/cookie-policy';
import { MEMBERSHIP_AGREEMENT } from '@/features/agreements/data/membership-agreement';
import { PRIVACY_POLICY } from '@/features/agreements/data/privacy-policy';
import { TERMS_OF_USE } from '@/features/agreements/data/terms-of-use';
import { ABOUT_US } from './about-us';
import { CANCELLATION_RETURN } from './cancellation-return';
import { InfoDocument, InfoDocumentSlug } from './info-page.types';
import { TRANSACTION_GUIDE } from './transaction-guide';

/**
 * Web'deki `LegalPageLayout` sayfalarının uygulama karşılıkları. Sözleşme
 * metinleri agreements özelliğinden gelir; "Sözleşmeler" ekranı ile aynı içerik
 * tek kaynaktan okunur.
 */
const INFO_DOCUMENTS: Record<InfoDocumentSlug, InfoDocument> = {
  hakkimizda: { slug: 'hakkimizda', title: 'Hakkımızda', blocks: ABOUT_US },
  'islem-rehberi': { slug: 'islem-rehberi', title: 'İşlem Rehberi', blocks: TRANSACTION_GUIDE },
  'iptal-iade-kosullari': {
    slug: 'iptal-iade-kosullari',
    title: 'Cayma, İptal ve İade Koşulları',
    blocks: CANCELLATION_RETURN,
  },
  'uyelik-sozlesmesi': {
    slug: 'uyelik-sozlesmesi',
    title: 'Üyelik Sözleşmesi',
    blocks: MEMBERSHIP_AGREEMENT,
  },
  'cerez-politikasi': { slug: 'cerez-politikasi', title: 'Çerez Politikası', blocks: COOKIE_POLICY },
  'kisisel-verilerin-korunmasi': {
    slug: 'kisisel-verilerin-korunmasi',
    title: 'Kişisel Verilerin Korunması',
    blocks: PRIVACY_POLICY,
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    blocks: TERMS_OF_USE,
  },
};

export const INFO_DOCUMENT_SLUGS = Object.keys(INFO_DOCUMENTS) as InfoDocumentSlug[];

/** Rota parametresindeki slug'a ait belgeyi döndürür; tanınmıyorsa `null`. */
export function findInfoDocument(slug: string | undefined): InfoDocument | null {
  if (!slug) return null;
  const key = slug.toLowerCase();
  return Object.prototype.hasOwnProperty.call(INFO_DOCUMENTS, key)
    ? INFO_DOCUMENTS[key as InfoDocumentSlug]
    : null;
}
