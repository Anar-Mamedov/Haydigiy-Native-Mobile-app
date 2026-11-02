import { isAxiosError } from 'axios';

const PARENT_ORDER_NOT_ELIGIBLE_CODE = 'parent_order_not_eligible';

/**
 * `/payment-router` answers 422 with this code when the approved order has started
 * being prepared in the warehouse: the difference can no longer be charged. The cart
 * is kept, so the customer can still check it out as a separate new order.
 */
export function isParentOrderNotEligibleError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const data = error.response?.data as { code?: unknown } | undefined;
  return data?.code === PARENT_ORDER_NOT_ELIGIBLE_CODE;
}
