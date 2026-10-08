import { InfoPageLink } from './info-page.types';

/**
 * Ana sayfa alt bilgisindeki kurumsal bağlantılar. Web'deki alt bilgi yasal
 * bağlantıları, CMS "Kurumsal/Müşteriler" menüsü (Hakkımızda, İşlem Rehberi,
 * Mağazadan Al) ve `LegalPageLayout` kenar menüsü birlikte düşünülerek sıralandı.
 */
export const FOOTER_INFO_LINKS: InfoPageLink[] = [
  { slug: 'hakkimizda', label: 'Hakkımızda' },
  { slug: 'islem-rehberi', label: 'İşlem Rehberi' },
  { slug: 'subeden-al', label: 'Mağazadan Al' },
  { slug: 'iptal-iade-kosullari', label: 'İptal ve İade Koşulları' },
  { slug: 'uyelik-sozlesmesi', label: 'Üyelik Sözleşmesi' },
  { slug: 'kullanim-kosullari', label: 'Kullanım Koşulları' },
  { slug: 'kisisel-verilerin-korunmasi', label: 'Kişisel Verilerin Korunması' },
  { slug: 'cerez-politikasi', label: 'Çerez Politikası' },
];

/** Yardım ekranında SSS'nin altında gösterilen alışveriş süreci rehberleri. */
export const HELP_INFO_LINKS: InfoPageLink[] = [
  { slug: 'islem-rehberi', label: 'İşlem Rehberi' },
  { slug: 'iptal-iade-kosullari', label: 'İptal ve İade Koşulları' },
  { slug: 'subeden-al', label: 'Mağazadan Al' },
];
