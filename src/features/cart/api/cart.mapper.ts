import { CartCampaignDto, CartItemDto } from './cart.dtos';
import { CartCampaign, CartLineItem } from '@/types/cart.types';

function toNumber(value: string | null | undefined): number {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Maps a backend cart line into the cart domain model consumed by the UI and the
 * Zustand store. The backend cart is keyed by `variant_id`, which is preserved so
 * update/remove mutations can target the correct line.
 */
export function mapCartItemDto(dto: CartItemDto): CartLineItem {
  const product = dto.product;
  const currentPrice = toNumber(dto.current_price ?? dto.price);
  const oldPrice = toNumber(dto.old_price);
  const stock = Number.parseInt(dto.stock_quantity ?? '', 10);

  return {
    variantId: String(dto.variant_id),
    productId: product?.id != null ? String(product.id) : String(dto.variant_id),
    title: product?.name ?? '',
    slug: product?.slug ?? '',
    imageUrl: product?.media?.thumb ?? '',
    sellerName: product?.seller_name ?? '',
    quantity: dto.quantity,
    unitPrice: currentPrice,
    originalPrice: oldPrice > currentPrice ? oldPrice : undefined,
    stock: Number.isFinite(stock) ? stock : undefined,
    size: dto.variant?.size?.name ?? undefined,
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
