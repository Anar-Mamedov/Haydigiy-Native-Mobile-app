import { Product } from '@/types/product.types';

export interface FavoritePricing {
  currentPrice: number;
  originalPrice: number;
  isDiscounted: boolean;
  discountAmount: number;
}

const PROMO_HINTS = ['indirim', 'kampanya', 'avantaj', 'flaş', 'flash', 'özel', '%'];

/**
 * Derives discount/pricing information for a favorite product from its base price,
 * variant prices and category tags. Shared between the favorites list and the card
 * so discount detection stays consistent in one place.
 */
export function getFavoritePricing(product: Product): FavoritePricing {
  const base = product.price;
  if (base <= 0) {
    return { currentPrice: 0, originalPrice: 0, isDiscounted: false, discountAmount: 0 };
  }

  let currentPrice = base;
  let isDiscounted = false;

  const variantPrices = (product.variants || []).map((v) => v.price).filter((p) => p > 0);
  if (variantPrices.length) {
    const minVariantPrice = Math.min(...variantPrices);
    if (minVariantPrice < base) {
      currentPrice = minVariantPrice;
      isDiscounted = true;
    }
  }

  const tags = product.categories ?? [];

  if (!isDiscounted) {
    for (const tag of tags) {
      const match = String(tag).match(/(\d+(?:[.,]\d+)?)\s*TL/i);
      if (!match) continue;
      const tagPrice = parseFloat(match[1].replace(',', '.'));
      if (tagPrice > 0 && tagPrice < base) {
        currentPrice = tagPrice;
        isDiscounted = true;
        break;
      }
    }
  }

  if (
    !isDiscounted &&
    tags.some((tag) => PROMO_HINTS.some((hint) => String(tag).toLowerCase().includes(hint)))
  ) {
    isDiscounted = true;
  }

  return {
    currentPrice,
    originalPrice: base,
    isDiscounted,
    discountAmount: base - currentPrice,
  };
}
