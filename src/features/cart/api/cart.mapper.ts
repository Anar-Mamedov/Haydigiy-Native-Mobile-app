import { CartCampaignDto, CartCampaignsResponseDto, CartItemDto } from './cart.dtos';
import { CartCampaign, CartCampaignBannerStatus, CartLineItem } from '@/types/cart.types';
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
  };
}

/** Sayı ya da sayısal metni negatif olmayan sonlu sayıya indirger; aksi halde `null`. */
function toFiniteAmount(value: unknown): number | null {
  const numberValue = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : null;
}

/**
 * `/cart/campaigns` yanıtını kampanya bandının modeline çevirir. Web'deki
 * `parseCartCampaignBannerStatus` ile birebir aynı davranır; iki platformun
 * aynı kampanyayı, aynı tutarı ve aynı metni göstermesi buna bağlıdır.
 *
 * Gösterilecek kampanya üç kademeli olarak seçilir:
 * 1. mesajı `primary_campaign_message` ile birebir eşleşen kampanya,
 * 2. yoksa `remaining > 0` olan ilk mesajlı kampanya,
 * 3. yoksa mesajı boş olmayan ilk kampanya.
 *
 * Hiçbiri yoksa ya da gösterilecek metin kalmıyorsa `null` döner ve bant hiç
 * render edilmez.
 *
 * Web'den tek kasıtlı sapma: 1. adım yalnızca `primary_campaign_message` gerçekten
 * doluysa çalışır. Backend bu alanı `null` gönderdiğinde web'deki karşılaştırma
 * boş metne düşüyor ve mesajı boşluktan ibaret olan ilk kampanyayla eşleşerek
 * bandı tamamen susturuyor; oysa listedeki sonraki kampanyanın gösterilebilir bir
 * mesajı olabilir. Primary mesaj dolu olduğunda iki platform aynı sonucu verir.
 */
export function mapCartCampaignBannerStatus(
  dto: CartCampaignsResponseDto | null | undefined,
): CartCampaignBannerStatus | null {
  if (!dto || !Array.isArray(dto.campaigns)) return null;

  const campaigns = dto.campaigns.filter(Boolean);
  const primaryMessage =
    typeof dto.primary_campaign_message === 'string' ? dto.primary_campaign_message.trim() : '';

  const selectedCampaign =
    (primaryMessage
      ? campaigns.find(
          (campaign) =>
            typeof campaign.message === 'string' && campaign.message.trim() === primaryMessage,
        )
      : undefined) ??
    campaigns.find(
      (campaign) => (toFiniteAmount(campaign.remaining) ?? 0) > 0 && typeof campaign.message === 'string',
    ) ??
    campaigns.find(
      (campaign) => typeof campaign.message === 'string' && campaign.message.trim().length > 0,
    );

  if (!selectedCampaign) return null;

  const campaignMessage =
    typeof selectedCampaign.message === 'string' ? selectedCampaign.message.trim() : '';
  const message = primaryMessage || campaignMessage;
  if (!message) return null;

  const currentAmount = toFiniteAmount(dto.campaign_basis) ?? toFiniteAmount(dto.subtotal) ?? 0;
  const thresholdValue = toFiniteAmount(selectedCampaign.threshold);
  const threshold = thresholdValue && thresholdValue > 0 ? thresholdValue : null;
  const apiProgress = toFiniteAmount(selectedCampaign.progress_percentage);
  const progress = apiProgress ?? (threshold ? Math.min(100, (currentAmount / threshold) * 100) : 100);
  const campaignName =
    typeof selectedCampaign.name === 'string' && selectedCampaign.name.trim()
      ? selectedCampaign.name.trim()
      : 'Sepet Kampanyası';

  return {
    campaignName,
    currentAmount,
    threshold,
    message,
    progress: Math.min(100, progress),
  };
}
