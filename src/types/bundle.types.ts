/**
 * Bundle (paket / set) domain modeli.
 *
 * Bundle'lar backend'de normal ürünler gibi tutulur ve API'den `is_bundle: true` ile
 * gelir. Fark, detay ekranında paketteki HER ürün için ayrı beden seçilmesi ve sepet
 * işlemlerinin `variant_id` yerine `bundle_group_id` üzerinden yürütülmesidir.
 *
 * Buradaki tipler ham API cevabı değil, ekranların tükettiği domain modelidir; ham
 * cevabı bu modele `@/features/product/api/bundle.mapper` çevirir.
 */

/** Paketteki bir ürünün seçilebilir bedeni. */
export type BundleVariantOption = {
  /** Liste render'ında kullanılan kararlı anahtar. */
  key: string;
  /**
   * Sepete `selections[].variant_id` olarak gönderilecek id: ürüne ÖZEL olan
   * `product_variant_id`. Kalemlerdeki `variant_id` alanı bedenin global tanımıdır
   * (aynı beden farklı ürünlerde aynı değeri alır) ve seçim için kullanılamaz.
   */
  variantId: string;
  name: string;
  name2?: string | null;
  /** Kalan stok. 0 ise beden seçilemez. */
  stock: number;
  hasStock: boolean;
};

/** Paketin içindeki tek bir ürün (detay ekranında beden seçilen kalem). */
export type BundleItem = {
  /** Sepete eklerken `selections[].bundle_item_id` olarak gönderilir. */
  bundleItemId: number;
  productId: number | null;
  title: string;
  slug: string | null;
  imageUrl: string;
  /** Ürünün paket dışındaki normal fiyatı. */
  price: number;
  /** Üstü çizili gösterilecek eski fiyat — yoksa null. */
  oldPrice: number | null;
  /** Pakette bu üründen kaç adet var (çoğunlukla 1). */
  quantity: number;
  /** Backend kalemi satılabilir buluyor ve en az bir bedeninde stok var mı? */
  isAvailable: boolean;
  variants: BundleVariantOption[];
};

/** Paket fiyat özeti — fiyat satırı ve ilerleme göstergesi için. */
export type BundleSummary = {
  itemCount: number;
  /** Paketteki ürünlerin tek tek fiyat toplamı ("ayrı ayrı alsan"). */
  itemsTotal: number;
  /** Paketin satış fiyatı. */
  bundlePrice: number;
  /** Paket fiyatı ile ürünlerin toplamı arasındaki fark. 0 ise indirim yok. */
  savings: number;
  savingsPercent: number;
  /** Paket satışa açık mı (`bundle.is_sellable` + `is_approved_for_sale`). */
  isSellable: boolean;
  /** Sepette çıkılabilecek en yüksek paket adedi. */
  maxQuantity: number;
};

/** Sepete ekleme isteğinin `selections` dizisindeki tek bir kayıt. */
export type BundleSelection = {
  bundleItemId: number;
  variantId: string;
};

/**
 * Sepet / ödeme / sipariş ekranlarında bundle satırının altında listelenen ürün.
 * Ayrı bir satır olarak DAVRANMAZ; adet ve silme yalnızca paketin kendisi üzerinden yapılır.
 */
export type BundleComponent = {
  key: string;
  /**
   * Siparişteki gerçek `order_item` id'si (yalnızca sipariş cevaplarında dolu gelir).
   * İptal, iade ve yorum gibi ürün bazlı işlemler bu id üzerinden yapılır.
   */
  orderItemId: number | null;
  title: string;
  slug: string | null;
  imageUrl: string;
  /** Beden adı — yoksa null. */
  variantName: string | null;
  quantity: number;
  price: number | null;
};
