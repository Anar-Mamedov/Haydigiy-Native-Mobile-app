import { AgreementBlock } from '@/features/agreements/data/agreement.types';

/**
 * Web'de kendi sayfası olan bilgi sayfaları. Slug'lar web yollarıyla birebir
 * aynıdır (`haydigiy.com/hakkimizda` → app `/bilgi/hakkimizda`), böylece derin
 * bağlantı eşlemesi ve paylaşılan linkler tek bir sözleşmeye dayanır.
 */
export type WebInfoDocumentSlug =
  | 'hakkimizda'
  | 'islem-rehberi'
  | 'iptal-iade-kosullari'
  | 'uyelik-sozlesmesi'
  | 'cerez-politikasi'
  | 'kisisel-verilerin-korunmasi'
  | 'gizlilik-politikasi'
  | 'kullanim-kosullari';

/**
 * Web'de ayrı bir yolu olmayan (web bunları pencerede gösterir), yalnızca
 * uygulama içi bağlantılarla açılan belgeler. Derin bağlantı eşlemesinde yer almaz.
 * Açık rıza ve ticari elektronik ileti metinleri kayıt formundaki onay kutularından açılır.
 */
export type AppOnlyInfoDocumentSlug = 'aydinlatma-metni' | 'acik-riza-metni' | 'ticari-elektronik-ileti';

export type InfoDocumentSlug = WebInfoDocumentSlug | AppOnlyInfoDocumentSlug;

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
