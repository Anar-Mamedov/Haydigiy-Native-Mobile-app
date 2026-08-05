import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

/**
 * Serializable product snapshot consumed by the Insider tracker. Keeping this a
 * plain object lets screens and mutations pass analytics context around without
 * touching the native SDK types.
 */
export type InsiderProductInput = {
  id: string;
  name: string;
  taxonomy: string[];
  imageUrl: string;
  /** List/original unit price; Insider requires a positive value. */
  price: number;
  currency: string;
  /** Discounted unit price when the product is on sale. */
  salePrice?: number;
  brand?: string;
  size?: string;
  quantity?: number;
  stock?: number;
  productUrl?: string;
};

/** Fallback when a record carries no category info (mirrors the product mapper). */
export const DEFAULT_INSIDER_TAXONOMY = ['Giyim'];

const PRODUCT_URL_BASE = 'https://haydigiy.com/product/';

function sanitizeTaxonomy(values: (string | undefined | null)[]): string[] {
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return cleaned.length > 0 ? cleaned : [...DEFAULT_INSIDER_TAXONOMY];
}

/**
 * Splits current/original pricing into Insider's price + salePrice pair: the
 * required `price` is the list price and `salePrice` is only set when the item
 * is actually discounted.
 */
function resolvePricing(currentPrice: number, originalPrice?: number): {
  price: number;
  salePrice?: number;
} {
  if (typeof originalPrice === 'number' && originalPrice > currentPrice) {
    return { price: originalPrice, salePrice: currentPrice };
  }
  return { price: currentPrice };
}

export function productToInsiderInput(
  product: Product,
  options: { size?: string; quantity?: number } = {},
): InsiderProductInput {
  return {
    id: product.id,
    name: product.title,
    taxonomy: sanitizeTaxonomy(
      product.categories && product.categories.length > 0
        ? product.categories
        : [product.category],
    ),
    imageUrl: product.imageUrl ?? '',
    currency: product.currency ?? 'TRY',
    ...resolvePricing(product.price, product.originalPrice),
    brand: product.brand || undefined,
    size: options.size,
    quantity: options.quantity,
    stock: product.totalQuantity,
    productUrl: product.slug ? `${PRODUCT_URL_BASE}${product.slug}` : undefined,
  };
}

/**
 * Builds a snapshot from screens that only hold partial product data (order
 * lines, review/question headers). Defaults mirror the full product mapper.
 */
export function buildInsiderInput(partial: {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  taxonomy?: string[];
  currency?: string;
  size?: string;
  quantity?: number;
  slug?: string;
}): InsiderProductInput {
  return {
    id: partial.id,
    name: partial.name,
    taxonomy: sanitizeTaxonomy(partial.taxonomy ?? []),
    imageUrl: partial.imageUrl ?? '',
    price: partial.price,
    currency: partial.currency ?? 'TRY',
    size: partial.size,
    quantity: partial.quantity,
    productUrl: partial.slug ? `${PRODUCT_URL_BASE}${partial.slug}` : undefined,
  };
}

export function cartItemToInsiderInput(item: CartLineItem): InsiderProductInput {
  return {
    id: item.productId,
    name: item.title,
    taxonomy: [...DEFAULT_INSIDER_TAXONOMY],
    imageUrl: item.imageUrl ?? '',
    currency: 'TRY',
    ...resolvePricing(item.unitPrice, item.originalPrice),
    size: item.size,
    quantity: item.quantity,
    stock: item.stock,
    productUrl: item.slug ? `${PRODUCT_URL_BASE}${item.slug}` : undefined,
  };
}

/** Insider ignores products missing id/name/price, so skip those client-side. */
export function isValidInsiderProductInput(input: InsiderProductInput): boolean {
  return input.id.trim() !== '' && input.name.trim() !== '' && input.price > 0;
}
