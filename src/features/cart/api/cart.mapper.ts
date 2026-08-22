import { CartCampaignDto, CartItemDto } from './cart.dtos';
import { CartCampaign, CartLineItem } from '@/types/cart.types';
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
  };
}
