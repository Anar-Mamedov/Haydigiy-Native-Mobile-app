export type CartCampaign = {
  id: number;
  name: string;
  type: string;
  isApplicable: boolean;
  threshold: number | null;
  remaining: number;
  discount?: number;
  endDate?: string | null;
  /** Kampanya bandında gösterilen yönlendirme metni. */
  message?: string | null;
  /** Backend'in hesapladığı ilerleme yüzdesi; yoksa eşikten türetilir. */
  progressPercentage?: number;
  /**
   * Geri sayım anahtarı. Backend yalnızca `1` gönderdiğinde kampanyanın bitiş
   * sayacı gösterilir; diğer değerlerde bitiş tarihi dolu olsa bile gizlenir.
   */
  counter?: number;
};

/** Kampanya bandındaki tek bir kampanya; bant birden fazlasını karusel gösterir. */
export type CartCampaignBannerSlide = {
  /** Karusel anahtarı; backend kampanya kimliği ya da sıra numarası. */
  id: string;
  campaignName: string;
  /** Eşiksiz kampanyalarda `null`; sayfa o zaman tek tutar gösterir. */
  threshold: number | null;
  message: string;
  /** 0-100 aralığına sıkıştırılmış ilerleme. */
  progress: number;
};

/**
 * Sepet kampanya bandının gösterime hazır modeli. Hangi kampanyaların
 * gösterileceği ve tutarların hangi alandan geleceği mapper'da çözülür; UI
 * yalnızca bu modeli tüketir ve ham backend yanıtını hiç görmez.
 *
 * Tutar yanıt seviyesinde tektir (`campaign_basis`), bu yüzden sayfalarda değil
 * burada durur; kampanyaya göre değişen eşik/metin sayfanın kendisindedir.
 */
export type CartCampaignBannerStatus = {
  currentAmount: number;
  /** En az bir sayfa; boşsa mapper `null` döner ve bant hiç render edilmez. */
  slides: CartCampaignBannerSlide[];
};

import { BundleComponent } from '@/types/bundle.types';

export type CartLineItem = {
  imageUrl: string;
  productId: string;
  quantity: number;
  sellerName: string;
  title: string;
  unitPrice: number;
  size?: string;
  /** Satırın renk adı; analytics (Insider `color`) için taşınır, UI kullanmaz. */
  color?: string;
  /** Server cart line identifier; required for update/remove API calls. */
  variantId?: string;
  /** Catalog slug used to deep-link back to the product detail screen. */
  slug?: string;
  /** Pre-discount unit price; drives the struck-through original price. */
  originalPrice?: number;
  /** Remaining stock for the selected variant; caps quantity and drives low-stock badges. */
  stock?: number;
  /**
   * Bundle satırlarında `'bundle'`. Paket sepette TEK satır görünür; içindeki ürünler
   * ayrı satır değildir ve adet/silme yalnızca paketin kendisi üzerinden yapılır.
   */
  itemType?: 'product' | 'bundle';
  /** Bundle satırının sepetteki kimliği; adet ve silme uçları bunu kullanır. */
  bundleGroupId?: string;
  bundleProductId?: string;
  /** Paket içeriği — yalnızca gösterim amaçlıdır. */
  bundleComponents?: BundleComponent[];
  /**
   * Satıra uygulanan kampanya indirimi. Yalnızca 0'dan büyükken anlamlıdır;
   * `campaignTotal` ile birlikte gelir, ikisi ayrı ayrı kullanılmaz.
   */
  campaignDiscount?: number;
  /** Kampanya indirimi sonrası satır toplamı (adet dahil). */
  campaignTotal?: number;
};
