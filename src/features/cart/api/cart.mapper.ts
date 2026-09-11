import { CartCampaignDto, CartCampaignsResponseDto, CartItemDto } from './cart.dtos';
import {
  CartCampaign,
  CartCampaignBannerSlide,
  CartCampaignBannerStatus,
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

/**
 * Maps a backend cart line into the cart domain model consumed by the UI and the
 * Zustand store. The backend cart is keyed by `variant_id`, which is preserved so
 * update/remove mutations can target the correct line.
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

  return {
    id: campaign.id !== undefined && campaign.id !== null ? String(campaign.id) : `slide-${index}`,
    campaignName: name || 'Sepet Kampanyası',
    threshold,
    message: readCampaignMessage(campaign),
    progress: Math.min(100, progress),
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
