/**
 * "İnternetten Al, Mağazadan Ücretsiz Teslim Al" — web `/subeden-al` sayfasının
 * metinleri. Görsel düzen ekran bileşenindedir; burada yalnızca içerik durur.
 */

export type StorePickupStepIcon = 'card' | 'store' | 'message' | 'package';

export type StorePickupStep = {
  number: string;
  title: string;
  description: string;
  icon: StorePickupStepIcon;
};

export const STORE_PICKUP_HERO = {
  badge: 'Niğde’ye özel',
  title: 'Niğde’deysen kargo ücreti ödeme!',
  description:
    'Haydigiy.com’daki binlerce ürün arasından dilediğini seç, siparişini online oluştur ve kargo ücreti ödemeden mağazamızdan teslim al.',
  cta: 'Alışverişe Başla',
  highlight: 'Ücretsiz teslimat',
};

export const STORE_PICKUP_HOW_IT_WORKS = {
  eyebrow: 'Mağazadan Al',
  title: 'Nasıl çalışır?',
  description:
    'Mağazamızdaki ürünlerle sınırlı değilsin. İnternet sitemizdeki daha fazla ürün, renk ve beden seçeneğinden yararlanabilirsin.',
};

export const STORE_PICKUP_STEPS: StorePickupStep[] = [
  {
    number: '01',
    title: 'Siparişini oluştur',
    description: 'Beğendiğin ürünleri sepete ekle ve siparişini kredi kartıyla tamamla.',
    icon: 'card',
  },
  {
    number: '02',
    title: '“Mağazadan Al – Niğde” seçeneğini seç',
    description:
      'Teslimat adımında Mağazadan Al seçeneğini işaretle. Bu teslimat seçeneği ücretsizdir.',
    icon: 'store',
  },
  {
    number: '03',
    title: 'SMS’imizi bekle',
    description:
      'Siparişini hazırlayıp Niğde mağazamıza ulaştırdığımızda her aşamada seni SMS ile bilgilendiririz.',
    icon: 'message',
  },
  {
    number: '04',
    title: 'Mağazadan teslim al',
    description:
      '“Siparişiniz mağazadan teslim alınmaya hazırdır” SMS’i geldikten sonra siparişini teslim alabilirsin.',
    icon: 'package',
  },
];

export const STORE_PICKUP_BENEFITS = {
  eyebrow: 'Neden Mağazadan Al?',
  title: 'Kargoya para verme, mağazadan kolayca teslim al.',
  items: [
    'Kargo ücreti yok',
    'İnternet mağazamızdaki çok daha geniş ürün seçeneğine erişim',
    'Mağazada bulunmayan ürün, renk ve bedenleri sipariş edebilme imkânı',
    'Sipariş sürecinin her aşamasında SMS ile bilgilendirme',
    'Siparişini sana uygun zamanda mağazamızdan teslim alma kolaylığı',
  ],
};
