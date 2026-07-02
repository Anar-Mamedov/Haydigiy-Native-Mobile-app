import { OrderCategory } from '@/types/order.types';

const ORDER_CATEGORIES: readonly OrderCategory[] = ['all', 'active', 'returned', 'cancelled'];

/**
 * Parses a route param into a known order category so deep links like
 * `/orders?category=returned` can preselect a filter chip. Unknown or missing
 * values return `null` (caller falls back to its default).
 */
export function parseOrderCategory(value: string | string[] | undefined): OrderCategory | null {
  const single = Array.isArray(value) ? value[0] : value;
  return ORDER_CATEGORIES.includes(single as OrderCategory) ? (single as OrderCategory) : null;
}
