import { CartCampaign } from '@/types/cart.types';

export type FreeShippingCampaignStatus = CartCampaign & {
  threshold: number;
  remaining: number;
  progress: number;
  isApplicable: boolean;
};

/**
 * Computes free-shipping campaign progress against the cart subtotal. Ported
 * 1:1 from the web `getFreeShippingCampaign` so mobile shows the same remaining
 * amount, progress bar and applicability.
 */
export function getFreeShippingCampaign(
  campaigns: CartCampaign[] | undefined,
  subtotal: number,
  now: number = Date.now(),
): FreeShippingCampaignStatus | null {
  const campaign = campaigns?.find((item) => item.type === 'free_shipping');
  if (!campaign) return null;

  const threshold = Number(campaign.threshold ?? 0);
  const hasThreshold = Number.isFinite(threshold) && threshold > 0;
  const normalizedSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const remaining = hasThreshold
    ? Math.max(0, threshold - normalizedSubtotal)
    : Math.max(0, Number(campaign.remaining ?? 0));
  const endTime = campaign.endDate ? new Date(campaign.endDate).getTime() : NaN;
  const isExpired = Number.isFinite(endTime) && endTime <= now;
  const isApplicable =
    !isExpired &&
    (hasThreshold ? normalizedSubtotal >= threshold - 0.01 : Boolean(campaign.isApplicable));
  const progress = hasThreshold
    ? Math.min(100, Math.max(0, (normalizedSubtotal / threshold) * 100))
    : isApplicable
      ? 100
      : 0;

  return {
    ...campaign,
    threshold: hasThreshold ? threshold : 0,
    remaining,
    progress,
    isApplicable,
  };
}

/**
 * Sum of applicable `cart_discount` campaigns. The backend applies these
 * automatically at order time, so the cart total must subtract the same amount,
 * matching the web `getCartDiscountCampaignTotal`.
 */
export function getCartDiscountCampaignTotal(
  campaigns: CartCampaign[] | undefined,
  subtotal: number,
  now: number = Date.now(),
): number {
  const normalizedSubtotal = Number.isFinite(subtotal) ? subtotal : 0;

  return (campaigns || [])
    .filter((campaign) => campaign.type === 'cart_discount')
    .reduce((total, campaign) => {
      const endTime = campaign.endDate ? new Date(campaign.endDate).getTime() : NaN;
      if (Number.isFinite(endTime) && endTime <= now) {
        return total;
      }

      const threshold = Number(campaign.threshold ?? 0);
      const hasThreshold = Number.isFinite(threshold) && threshold > 0;
      const isApplicable = hasThreshold
        ? normalizedSubtotal >= threshold - 0.01
        : Boolean(campaign.isApplicable);
      if (!isApplicable) return total;

      const discount = Number(campaign.discount ?? 0);
      return total + (Number.isFinite(discount) ? Math.max(0, discount) : 0);
    }, 0);
}
