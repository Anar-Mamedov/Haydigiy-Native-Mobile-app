/**
 * Extracts the trailing product code from a product display name.
 *
 * Backend product names follow the "{name} - {code}" convention
 * (e.g. "Spor Ayakkabı Siyah - 31678.264."). The code rendered on the image
 * badge must stay consistent with the code the user sees in the title, so both
 * are derived from the same source (the product name) instead of the separate
 * `stock_code` field, which is a different per-variant SKU and would mismatch.
 *
 * Returns `undefined` when the name has no " - {code}" segment, so callers can
 * simply hide the badge.
 */
export function extractProductCode(title: string | undefined | null): string | undefined {
  if (!title) return undefined;

  const separatorIndex = title.lastIndexOf(' - ');
  if (separatorIndex === -1) return undefined;

  const code = title.slice(separatorIndex + ' - '.length).trim();
  return code.length > 0 ? code : undefined;
}
