import { AgreementBlock } from '@/features/agreements/data/agreement.types';

/**
 * Uygulamadaki bilgi sayfaları. Slug'lar web yollarıyla birebir aynıdır
 * (`haydigiy.com/hakkimizda` → app `/bilgi/hakkimizda`), böylece derin bağlantı
 * eşlemesi ve paylaşılan linkler tek bir sözleşmeye dayanır.
 */
export type InfoDocumentSlug =
  | 'hakkimizda'
  | 'islem-rehberi'
  | 'iptal-iade-kosullari'
  | 'uyelik-sozlesmesi'
  | 'cerez-politikasi'
  | 'kisisel-verilerin-korunmasi'
  | 'kullanim-kosullari';

/** "Şubeden Al / Mağazadan Al" tanıtım sayfası; metin belgesi değil, kendi ekranı var. */
export const STORE_PICKUP_SLUG = 'subeden-al';

export type InfoPageSlug = InfoDocumentSlug | typeof STORE_PICKUP_SLUG;

/** Başlık + içerik bloklarından oluşan statik metin sayfası. */
export type InfoDocument = {
  slug: InfoDocumentSlug;
  title: string;
  blocks: AgreementBlock[];
};

/** Alt bilgi / yardım ekranındaki bağlantı satırı. */
export type InfoPageLink = {
  slug: InfoPageSlug;
  label: string;
};
