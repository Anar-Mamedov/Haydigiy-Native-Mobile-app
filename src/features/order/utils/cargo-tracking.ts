/**
 * Rules for deciding whether a tracking code may be shown to the customer.
 *
 * The Aras Kargo integration keeps the order's own number (`HG` + digits) in `tracking_code`
 * until the carrier processes the shipment and issues a real tracking number. That value
 * cannot be queried at the carrier, so it must never be shown as a tracking number; the
 * customer sees an explanatory message instead.
 *
 * The placeholder is specific to that integration, so the rule only applies to Aras Kargo
 * shipments — other carriers' codes are shown exactly as they arrive, even if they happen to
 * look like the internal format.
 */

/** Shown in the tracking field until a real tracking number exists. */
export const CARGO_TRACKING_PENDING_MESSAGE =
  'Kargo firması işlem yaptığında takip numaranız burada görünecektir.';

/** The internal placeholder shares the order-number format: `HG` followed by digits. */
const INTERNAL_TRACKING_CODE_PATTERN = /^HG\d+$/i;

/** Carrier name arrives as free text ("Aras Kargo", "ARAS KARGO", "Aras"). */
const ARAS_CARGO_PATTERN = /aras/i;

export type CustomerTrackingCodeInput = {
  /** `trackingCode` from the order or the cargo-tracking response. */
  trackingCode?: string | null;
  /** The order's own number, so a copied value is caught even if the prefix changes. */
  orderNo?: string | null;
  /** Carrier name; the placeholder rule only applies to Aras Kargo. */
  cargoCompanyName?: string | null;
};

/** Whether the shipment belongs to the integration that produces the placeholder value. */
export function isArasCargoCompany(cargoCompanyName?: string | null): boolean {
  const name = cargoCompanyName?.trim();
  return !!name && ARAS_CARGO_PATTERN.test(name);
}

/**
 * Returns the tracking code that may be shown to the customer, or `null` when there is no
 * code yet or the value is still the Aras Kargo placeholder. Callers render the pending
 * message — and hide the tracking action — for `null`.
 */
export function getCustomerTrackingCode(input: CustomerTrackingCodeInput): string | null {
  const trackingCode = input.trackingCode?.trim();
  if (!trackingCode) return null;

  // Placeholder only exists on Aras Kargo shipments; never filter other carriers' codes.
  if (!isArasCargoCompany(input.cargoCompanyName)) return trackingCode;

  if (INTERNAL_TRACKING_CODE_PATTERN.test(trackingCode)) return null;

  const orderNo = input.orderNo?.trim();
  if (orderNo && trackingCode.toUpperCase() === orderNo.toUpperCase()) return null;

  return trackingCode;
}

/** Whether the tracking field should show the pending message instead of a code. */
export function isCargoTrackingPending(input: CustomerTrackingCodeInput): boolean {
  return getCustomerTrackingCode(input) === null;
}
