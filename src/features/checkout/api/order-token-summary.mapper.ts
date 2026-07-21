import type { OrderTokenResponseDto } from '@/services/checkout.service';
import type { OrderTokenSummary } from '@/types/checkout.types';

export const ORDER_TOKEN_SUMMARY_FIELDS = [
  'subtotal',
  'user_discount_amount',
  'campaign_discount_amount',
  'coupon_price',
  'cargo_price',
  'cod_price',
  'payment_commission_rate',
  'payment_fee',
  'installment_count',
  'interest_amount',
  'total_price',
] as const satisfies readonly (keyof OrderTokenResponseDto)[];

export type OrderTokenSummaryField = (typeof ORDER_TOKEN_SUMMARY_FIELDS)[number];

export type OrderTokenSummaryMapResult =
  { ok: true; summary: OrderTokenSummary } | { ok: false; missingFields: OrderTokenSummaryField[] };

function parseRequiredAmount(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  let normalized = value.trim().replace(/\s/g, '');
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  } else if ((normalized.match(/\./g) || []).length > 1) {
    normalized = normalized.replace(/\./g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Maps a complete order-token response into the stable checkout summary model. */
export function mapOrderTokenSummary(dto: OrderTokenResponseDto): OrderTokenSummaryMapResult {
  const parsed = new Map<OrderTokenSummaryField, number>();
  const missingFields: OrderTokenSummaryField[] = [];

  for (const field of ORDER_TOKEN_SUMMARY_FIELDS) {
    const amount = parseRequiredAmount(dto[field]);
    if (amount === null) {
      missingFields.push(field);
    } else {
      parsed.set(field, amount);
    }
  }

  if (missingFields.length > 0) {
    return { ok: false, missingFields };
  }

  const amount = (field: OrderTokenSummaryField): number => parsed.get(field)!;

  return {
    ok: true,
    summary: {
      subtotal: amount('subtotal'),
      userDiscount: amount('user_discount_amount'),
      campaignDiscount: amount('campaign_discount_amount'),
      couponDiscount: amount('coupon_price'),
      cargoPrice: amount('cargo_price'),
      serviceFee: amount('cod_price'),
      commissionRate: amount('payment_commission_rate'),
      commission: amount('payment_fee'),
      installmentCount: amount('installment_count'),
      installmentFee: amount('interest_amount'),
      totalPrice: amount('total_price'),
      isFreeShippingCoupon: Boolean(dto.coupon?.is_free_shipping),
    },
  };
}

export function getOrderTokenSummaryError(missingFields: OrderTokenSummaryField[]): string {
  return `Sipariş tutarları API yanıtında eksik: ${missingFields.join(', ')}.`;
}
