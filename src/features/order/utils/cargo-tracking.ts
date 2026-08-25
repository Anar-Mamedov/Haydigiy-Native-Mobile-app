/**
 * Rules for deciding whether a tracking code may be shown to the customer.
 *
 * Until the carrier processes the shipment and issues a real tracking number, the backend
 * keeps the order's own number (`HG` + digits) in `tracking_code`. That value cannot be
 * queried at the carrier, so it must never be shown as a tracking number; the customer sees
 * an explanatory message instead.
 */

/** Shown in the tracking field until a real tracking number exists. */
export const CARGO_TRACKING_PENDING_MESSAGE =
  'Kargo firması işlem yaptığında takip numaranız burada görünecektir.';

/** The internal placeholder shares the order-number format: `HG` followed by digits. */
const INTERNAL_TRACKING_CODE_PATTERN = /^HG\d+$/i;

/**
 * Returns the tracking code that may be shown to the customer, or `null` when the value is
 * missing, still the internal `HG…` placeholder, or a copy of the order number itself.
 * Callers render the pending message — and hide the tracking action — for `null`.
 *
 * @param trackingCode `trackingCode` from the order or the cargo-tracking response.
 * @param orderNo The order's own number, so a copied value is caught even if the prefix changes.
 */
export function getCustomerTrackingCode(
  trackingCode?: string | null,
  orderNo?: string | null,
): string | null {
  const normalizedTrackingCode = trackingCode?.trim();
  if (!normalizedTrackingCode) return null;

  if (INTERNAL_TRACKING_CODE_PATTERN.test(normalizedTrackingCode)) return null;

  const normalizedOrderNo = orderNo?.trim();
  if (normalizedOrderNo && normalizedTrackingCode.toUpperCase() === normalizedOrderNo.toUpperCase()) {
    return null;
  }

  return normalizedTrackingCode;
}

/** Whether the tracking field should show the pending message instead of a code. */
export function isCargoTrackingPending(
  trackingCode?: string | null,
  orderNo?: string | null,
): boolean {
  return getCustomerTrackingCode(trackingCode, orderNo) === null;
}
