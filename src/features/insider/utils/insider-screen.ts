import { InsiderPayload } from '../types/insider.types';

function readId(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  return typeof value === 'string' && /^[1-9]\d*$/.test(value.trim()) ? value.trim() : null;
}

function readSlug(value: unknown): string | null {
  return typeof value === 'string' && /^[\p{L}\p{N}_-]+$/u.test(value.trim())
    ? value.trim()
    : null;
}

/** App-owned contract for the API's custom deep_link keys (also valid inside ins_dl_json). */
export function resolveInsiderScreen(data: InsiderPayload): string | null {
  switch (data.screen) {
    case 'product':
    case 'product_detail': {
      // The existing product query resolves numeric IDs to their current slug.
      const product = readSlug(data.product_slug) ?? readId(data.product_id);
      return product ? `/product/${product}` : null;
    }
    case 'category': {
      const categoryId = readId(data.category_id);
      const slug = readSlug(data.category_slug) ?? 'all';
      return categoryId ? `/kategori/${slug}?c=${categoryId}` : null;
    }
    case 'order': {
      const orderId = readId(data.order_id);
      return orderId ? `/order/${orderId}` : null;
    }
    case 'home':
      return '/';
    case 'cart':
      return '/cart';
    case 'favorites':
      return '/favorites';
    case 'orders':
      return '/orders';
    case 'profile':
      return '/profile';
    default:
      return null;
  }
}
