/**
 * Resolves the product-detail route target for a selected color variant.
 *
 * Mirrors the web search/cart behavior: navigate to the variant's own slug,
 * falling back to the active product's slug, then to the variant id. Returns
 * `null` when nothing usable is available so callers can safely skip navigation
 * instead of pushing a broken route.
 */
export function resolveColorVariantTarget(
  variant: { slug?: string | null; id?: string | null },
  activeProductSlug?: string | null,
): string | null {
  return variant.slug || activeProductSlug || variant.id || null;
}
