/**
 * Analytics domain sözleşmesi.
 *
 * Ekranlar ve mutasyonlar yalnızca bu tipleri üretir; hangi sağlayıcıya (kendi
 * collector'ımız, GA4, Meta) hangi alan adıyla gittiği sink'lerin sorumluluğudur.
 * Yeni bir sağlayıcı eklemek yeni bir sink dosyası demektir; buradaki event
 * listesi ve çağrı yerleri değişmez.
 */

/** Tek bir ürünün analytics anlık görüntüsü. Sink'ler bunu kendi şemasına çevirir. */
export type AnalyticsProduct = {
  /** Backend ürün kimliği. Sayısal olmayan değerler sink tarafında düşürülür. */
  id: string;
  name: string;
  /** Kullanıcının o an gördüğü/ödediği birim fiyat. */
  price: number;
  currency: string;
  quantity?: number;
  variantId?: string;
  categoryId?: number;
  /** Taksonomi yaprağı; GA4 `item_category` karşılığı. */
  category?: string;
  brand?: string;
};

/** Oturum sahibinin kimliği. PII taşır; yalnızca kimlik gerektiren sink'lere verilir. */
export type AnalyticsIdentity = {
  userId: number;
  email?: string;
  /** E164 formatında telefon. */
  phone?: string;
};

/**
 * Uygulamanın ürettiği bütün event'ler. Ayrık birleşim (discriminated union)
 * olması, yeni event eklendiğinde hangi sink'in onu ele almadığını tip
 * denetleyicisinin değil, sink'in kendi `switch`'inin sessizce atlamasını sağlar
 * — analytics asla akışı kırmamalı.
 */
export type AnalyticsEvent =
  | { name: 'screen_viewed'; screen: string }
  | { name: 'product_viewed'; product: AnalyticsProduct }
  | { name: 'category_viewed'; categoryId: number; categoryName?: string }
  | { name: 'search_performed'; query: string; resultCount?: number }
  | { name: 'filter_applied'; filters: Record<string, string | number | boolean> }
  | { name: 'add_to_cart'; product: AnalyticsProduct }
  | { name: 'remove_from_cart'; product: AnalyticsProduct }
  | { name: 'cart_cleared'; itemCount: number }
  | { name: 'add_to_wishlist'; product: AnalyticsProduct }
  | { name: 'remove_from_wishlist'; productId: string }
  | { name: 'checkout_started'; revenue: number; currency: string; products: AnalyticsProduct[] }
  | {
      name: 'payment_result';
      /**
       * `pending`, bankanın ödemeyi kontrolde tuttuğu üçüncü gerçek sonuçtur.
       * Başarısız sayılırsa dönüşüm hunisi olduğundan kötü raporlanır.
       */
      status: 'success' | 'failed' | 'pending';
      orderId?: string;
      /**
       * Sınıflandırılmış sebep. Banka/kart hata metni **buraya yazılmaz**:
       * serbest metin hem kardinaliteyi patlatır hem kişisel veri taşıyabilir.
       */
      reason?: string;
    }
  | {
      name: 'purchase_completed';
      orderId: string;
      revenue: number;
      currency: string;
      products: AnalyticsProduct[];
    }
  | { name: 'user_signed_up' }
  | { name: 'user_logged_in'; method?: string }
  | { name: 'user_logged_out'; reason?: string };

export type AnalyticsEventName = AnalyticsEvent['name'];
