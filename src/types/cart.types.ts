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
};

/**
 * Sepet kampanya bandının gösterime hazır modeli. Hangi kampanyanın seçileceği
 * ve tutarların hangi alandan geleceği mapper'da çözülür; UI yalnızca bu modeli
 * tüketir ve ham backend yanıtını hiç görmez.
 */
export type CartCampaignBannerStatus = {
  campaignName: string;
  currentAmount: number;
  /** Eşiksiz kampanyalarda `null`; bant o zaman tek tutar gösterir. */
  threshold: number | null;
  message: string;
  /** 0-100 aralığına sıkıştırılmış ilerleme. */
  progress: number;
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
};
