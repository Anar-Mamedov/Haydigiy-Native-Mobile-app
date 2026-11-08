import {
  AvailableGiftDto,
  CartCampaignDto,
  CartCampaignsResponseDto,
  CartItemDto,
} from './cart.dtos';
import {
  AvailableGift,
  AvailableGiftSize,
  CartCampaign,
  CartCampaignBannerSlide,
  CartCampaignBannerStatus,
  CartCampaignGiftDetails,
  CartLineItem,
} from '@/types/cart.types';
import { isBundleLine, mapBundleComponents } from '@/features/bundle/api/bundle.mapper';

function toNumber(value: string | null | undefined): number {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

/** A price field parsed like the backend charge guard: 0/negative/unparseable → absent. */
function toPositivePrice(value: string | null | undefined): number | null {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Kampanya tutarları sayı ya da sayısal metin gelebilir; geçersizse yok sayılır. */
function toAmount(value: number | string | null | undefined): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : null;
}

/** Adet alanları sayı ya da sayısal metin gelebilir; geçersizse en az 1 kabul edilir. */
function toPositiveCount(value: unknown): number {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * Satırın tamamı ücretsiz kampanya hediyesi mi? Backend bundle dışı her satırı
 * tek `cart_item_id` ile döndürür; `gift_quantity` ya 0 ya da satırın tüm adedidir.
 * Ücretli/hediye karışık satır bu yüzden yoktur ve hediye sayılmaz.
 */
function isWholeGiftLine(dto: CartItemDto, isBundle: boolean): boolean {
  if (isBundle) return false;
  const giftQuantity = Number(dto.gift_quantity ?? 0);
  return Number.isFinite(giftQuantity) && giftQuantity > 0 && giftQuantity >= dto.quantity;
}

/**
 * Maps a backend cart line into the cart domain model consumed by the UI and the
 * Zustand store. Normal lines carry both `variant_id` and `cart_item_id`; the
 * latter targets a single row because a variant's paid and gift rows stay apart.
 */
export function mapCartItemDto(dto: CartItemDto): CartLineItem {
  const product = dto.product;
  // Charge parity: /order/token prices every line as `discounted_price > 0 ?
  // discounted_price : price` and the web payment page mirrors that with
  // `current_discounted_price || current_price || price`. The unit price must
  // follow the same precedence, or checkout totals drift from the amount the
  // backend charges and the place-order total guard rejects the payment.
  const currentPrice =
    toPositivePrice(dto.current_discounted_price) ??
    toPositivePrice(dto.current_price) ??
    toNumber(dto.price);
  const oldPrice = toNumber(dto.old_price);
  const stock = Number.parseInt(dto.stock_quantity ?? '', 10);

  const isBundle = isBundleLine(dto);

  // İndirim ve indirimli toplam yalnızca birlikte anlamlı: biri eksikse satır
  // normal fiyatıyla gösterilir, yarım bir kampanya fiyatı hiç sızmaz.
  const campaignDiscount = toAmount(dto.campaign_discount) ?? 0;
  const campaignTotal = toAmount(dto.campaign_total);
  const hasCampaignPrice = campaignDiscount > 0 && campaignTotal !== null;
  const hasCartItemId = !isBundle && dto.cart_item_id != null;

  return {
    // Bundle satırının `variant_id`'si yoktur; kimlik `bundleGroupId` üzerinden taşınır.
    variantId: dto.variant_id != null ? String(dto.variant_id) : undefined,
    productId:
      product?.id != null
        ? String(product.id)
        : dto.bundle_product_id != null
        ? String(dto.bundle_product_id)
        : String(dto.variant_id ?? ''),
    title: product?.name ?? '',
    slug: product?.slug ?? '',
    imageUrl: product?.media?.thumb ?? '',
    sellerName: product?.seller_name ?? '',
    quantity: dto.quantity,
    unitPrice: currentPrice,
    originalPrice: oldPrice > currentPrice ? oldPrice : undefined,
    stock: Number.isFinite(stock) ? stock : undefined,
    size: dto.variant?.size?.name ?? undefined,
    color: (product?.color?.name ?? product?.color_name)?.trim() || undefined,
    ...(hasCampaignPrice ? { campaignDiscount, campaignTotal } : {}),
    // Bundle satırı `bundle_group_id` ile hedeflenir; satır kimliği yalnız normal ürünlerde taşınır.
    ...(hasCartItemId ? { cartItemId: String(dto.cart_item_id) } : {}),
    ...(isWholeGiftLine(dto, isBundle) ? { isGift: true } : {}),
    ...(isBundle
      ? {
          itemType: 'bundle' as const,
          bundleGroupId: dto.bundle_group_id ?? undefined,
          bundleProductId: dto.bundle_product_id != null ? String(dto.bundle_product_id) : undefined,
          bundleComponents: mapBundleComponents(dto.bundle?.components),
        }
      : { itemType: 'product' as const }),
  };
}

/** Drops malformed lines (e.g. a deleted product) so the UI never crashes on null. */
export function mapCartResponse(items: CartItemDto[]): CartLineItem[] {
  return items.filter((item) => item?.product).map(mapCartItemDto);
}

function mapAvailableGiftSizes(dto: AvailableGiftDto): AvailableGiftSize[] {
  if (!Array.isArray(dto.variants)) return [];

  return dto.variants
    .filter((variant) => variant?.variant_id != null)
    .map((variant) => ({
      variantId: String(variant.variant_id),
      name: (typeof variant.name === 'string' ? variant.name.trim() : '') || 'Standart',
      availableQuantity: Math.max(0, Number(variant.available_quantity) || 0),
      canAdd: Boolean(variant.can_add),
    }));
}

/**
 * Tek hediye teklifini domain modeline çevirir. Kampanya kimliği ya da bedeni
 * olmayan teklif eklenemeyeceği için gösterilmez (`null`).
 */
function mapAvailableGiftDto(dto: AvailableGiftDto | null | undefined): AvailableGift | null {
  if (!dto || dto.product_id == null) return null;

  const campaignId = (Array.isArray(dto.campaign_ids) ? dto.campaign_ids : []).find(
    (id) => Number.isFinite(Number(id)) && Number(id) > 0,
  );
  const sizes = mapAvailableGiftSizes(dto);
  if (campaignId === undefined || sizes.length === 0) return null;

  return {
    productId: String(dto.product_id),
    campaignId: String(campaignId),
    name: (typeof dto.name === 'string' ? dto.name.trim() : '') || 'Hediye ürün',
    slug: dto.slug || undefined,
    imageUrl: dto.image ?? '',
    quantity: toPositiveCount(dto.quantity),
    sizes,
  };
}

/** `/cart/list` yanıtındaki `available_gifts` alanını sepet ekranının modeline çevirir. */
export function mapAvailableGifts(dtos: AvailableGiftDto[] | null | undefined): AvailableGift[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(mapAvailableGiftDto).filter((gift): gift is AvailableGift => gift !== null);
}

export function mapCartCampaignDto(dto: CartCampaignDto): CartCampaign {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    isApplicable: Boolean(dto.is_applicable),
    threshold: dto.threshold,
    remaining: Number(dto.remaining ?? 0),
    discount: dto.discount,
    endDate: dto.end_date ?? null,
    message: dto.message ?? null,
    progressPercentage: dto.progress_percentage,
    counter: dto.counter,
  };
}

/** Sayı ya da sayısal metni negatif olmayan sonlu sayıya indirger; aksi halde `null`. */
function toFiniteAmount(value: unknown): number | null {
  const numberValue = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : null;
}

/** Kampanyanın gösterilecek metni; boşluktan ibaretse gösterilebilir metin yoktur. */
function readCampaignMessage(campaign: CartCampaignDto): string {
  return typeof campaign.message === 'string' ? campaign.message.trim() : '';
}

function isGiftCampaign(campaign: CartCampaignDto): boolean {
  return campaign.type === 'gift_product' || campaign.campaign_type === 'gift_product';
}

/**
 * Hediye kampanyasının bant içeriği. Şartlar backend'in cümleleriyle olduğu gibi
 * taşınır; web'in yaptığı gibi metinden kategori/adet ayrıştırılmaz (metin
 * değişince bozulur ve iş kuralı istemciye gömülür). Hediye ürünü yoksa sayfa
 * normal kampanya sayfası olarak kalır.
 */
function toGiftDetails(campaign: CartCampaignDto): CartCampaignGiftDetails | undefined {
  if (!isGiftCampaign(campaign) || !Array.isArray(campaign.gift_products)) return undefined;

  const products = campaign.gift_products
    .filter((gift) => gift?.product_id != null)
    .map((gift) => ({
      productId: String(gift.product_id),
      name: (typeof gift.name === 'string' ? gift.name.trim() : '') || 'Hediye ürün',
      imageUrl: gift.image ?? '',
      quantity: toPositiveCount(gift.quantity),
    }));
  if (products.length === 0) return undefined;

  const conditions = (Array.isArray(campaign.conditions) ? campaign.conditions : [])
    .filter((condition): condition is string => typeof condition === 'string')
    .map((condition) => condition.trim())
    .filter((condition) => condition.length > 0);

  return { products, conditions };
}

function toBannerSlide(
  campaign: CartCampaignDto,
  index: number,
  currentAmount: number,
): CartCampaignBannerSlide {
  const thresholdValue = toFiniteAmount(campaign.threshold);
  const threshold = thresholdValue && thresholdValue > 0 ? thresholdValue : null;
  const name = typeof campaign.name === 'string' ? campaign.name.trim() : '';
  // Backend yüzdeyi göndermezse kampanyanın kendi eşiğinden türetilir.
  const apiProgress = toFiniteAmount(campaign.progress_percentage);
  const progress = apiProgress ?? (threshold ? (currentAmount / threshold) * 100 : 100);
  const gift = toGiftDetails(campaign);

  return {
    id: campaign.id !== undefined && campaign.id !== null ? String(campaign.id) : `slide-${index}`,
    campaignName: name || 'Sepet Kampanyası',
    threshold,
    message: readCampaignMessage(campaign),
    progress: Math.min(100, progress),
    ...(gift ? { gift } : {}),
  };
}

/**
 * `/cart/campaigns` yanıtını kampanya bandının modeline çevirir.
 *
 * Backend aynı sepet için birden fazla kampanya döndürebilir (ücretsiz kargo +
 * sepet indirimi + kategori indirimi gibi). Hepsi gösterilebilir metni olduğu
 * sürece birer karusel sayfası olur; `primary_campaign_message` ile eşleşen
 * kampanya öne alınır, kalanlar backend sırasını korur.
 *
 * Hiçbir kampanyanın metni yoksa ama `primary_campaign_message` doluysa bant tek
 * sayfayla o metni gösterir. Gösterilecek hiçbir metin kalmıyorsa `null` döner
 * ve bant hiç render edilmez.
 */
export function mapCartCampaignBannerStatus(
  dto: CartCampaignsResponseDto | null | undefined,
): CartCampaignBannerStatus | null {
  if (!dto || !Array.isArray(dto.campaigns)) return null;

  const campaigns = dto.campaigns.filter(Boolean);
  const primaryMessage =
    typeof dto.primary_campaign_message === 'string' ? dto.primary_campaign_message.trim() : '';
  const currentAmount = toFiniteAmount(dto.campaign_basis) ?? toFiniteAmount(dto.subtotal) ?? 0;

  const displayable = campaigns.filter((campaign) => readCampaignMessage(campaign).length > 0);
  const primaryIndex = primaryMessage
    ? displayable.findIndex((campaign) => readCampaignMessage(campaign) === primaryMessage)
    : -1;
  const ordered =
    primaryIndex > 0
      ? [displayable[primaryIndex], ...displayable.filter((_, index) => index !== primaryIndex)]
      : displayable;

  const slides = ordered.map((campaign, index) => toBannerSlide(campaign, index, currentAmount));

  if (slides.length === 0) {
    if (!primaryMessage) return null;

    // Kampanyaların kendi metni yok ama backend gösterilecek bir mesaj verdi.
    return {
      currentAmount,
      slides: [
        {
          id: 'primary',
          campaignName: 'Sepet Kampanyası',
          threshold: null,
          message: primaryMessage,
          progress: 0,
        },
      ],
    };
  }

  return { currentAmount, slides };
}
