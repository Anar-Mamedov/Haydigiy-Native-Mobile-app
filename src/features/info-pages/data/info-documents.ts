import { COMMERCIAL_MESSAGE_CONSENT } from '@/features/agreements/data/commercial-message-consent';
import { COOKIE_POLICY } from '@/features/agreements/data/cookie-policy';
import { DISCLOSURE } from '@/features/agreements/data/disclosure';
import { EXPLICIT_CONSENT } from '@/features/agreements/data/explicit-consent';
import { KVKK_DISCLOSURE_NOTICE } from '@/features/agreements/data/kvkk-disclosure-notice';
import { MEMBERSHIP_AGREEMENT } from '@/features/agreements/data/membership-agreement';
import { TERMS_OF_USE } from '@/features/agreements/data/terms-of-use';
import { ABOUT_US } from './about-us';
import { CANCELLATION_RETURN } from './cancellation-return';
import { AppOnlyInfoDocumentSlug, InfoDocument, InfoDocumentSlug } from './info-page.types';
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
  // Web sayfası kayıt formundaki Aydınlatma Metni ile aynı metni gösterir (HF-62)
  'kisisel-verilerin-korunmasi': {
    slug: 'kisisel-verilerin-korunmasi',
    title: 'Kişisel Verilerin Korunması',
    blocks: KVKK_DISCLOSURE_NOTICE,
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    blocks: TERMS_OF_USE,
  },
  'aydinlatma-metni': {
    slug: 'aydinlatma-metni',
    title: 'Aydınlatma Metni',
    blocks: DISCLOSURE,
  },
  'acik-riza-metni': {
    slug: 'acik-riza-metni',
    title: 'Açık Rıza Metni',
    blocks: EXPLICIT_CONSENT,
  },
  'ticari-elektronik-ileti': {
    slug: 'ticari-elektronik-ileti',
    title: 'Ticari Elektronik İleti',
    blocks: COMMERCIAL_MESSAGE_CONSENT,
  },
};

export const INFO_DOCUMENT_SLUGS = Object.keys(INFO_DOCUMENTS) as InfoDocumentSlug[];

/** Web'de karşılığı olmayan, derin bağlantıyla açılmayan belgeler. */
export const APP_ONLY_INFO_DOCUMENT_SLUGS: readonly AppOnlyInfoDocumentSlug[] = [
  'aydinlatma-metni',
  'acik-riza-metni',
  'ticari-elektronik-ileti',
];

/** Rota parametresindeki slug'a ait belgeyi döndürür; tanınmıyorsa `null`. */
export function findInfoDocument(slug: string | undefined): InfoDocument | null {
  if (!slug) return null;
  const key = slug.toLowerCase();
  return Object.prototype.hasOwnProperty.call(INFO_DOCUMENTS, key)
    ? INFO_DOCUMENTS[key as InfoDocumentSlug]
    : null;
}
