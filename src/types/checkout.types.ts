/**
 * Domain models for the checkout / payment screen. These are the camelCase shapes
 * the UI consumes; the `features/checkout/api` mappers convert the snake_case
 * backend DTOs into them. Mirrors the web `MobilePayment` data, minus PayTR.
 */

export type CouponDiscountType = 'percentage' | 'fixed' | 'free_shipping';

/** A payment option from `GET /payment-types` (credit_card, kapida_odeme, …). */
export type PaymentMethod = {
  id: number;
  name: string;
  slug: string;
  commissionRate: number;
  serviceFee: number;
  sortOrder: number;
  description: string | null;
  /** Orders at/above this total may only pay by card; null means no cap. */
  maxOrderTotal: number | null;
};

/** A shipping option from `GET /cargo-companies(/available)`. */
export type CargoCompany = {
  id: number;
  name: string;
  logo: string;
  /** Parsed numeric price (the backend returns it as a string). */
  price: number;
  sortOrder: number;
};

/** A single installment plan row from the İyzico BIN/installment rate lookup. */
export type InstallmentPlan = {
  installment: number;
  ratio: number;
  total: number;
  perMonth: number;
};

/** A coupon that has been validated and applied to the order. */
export type AppliedCoupon = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discount: number;
  isFreeShipping: boolean;
  isCombinable?: boolean;
};

/**
 * API-authoritative monetary snapshot returned by `POST /order/token`.
 * Checkout UI and payment routing consume this model without recalculating it.
 */
export type OrderTokenSummary = {
  subtotal: number;
  userDiscount: number;
  campaignDiscount: number;
  couponDiscount: number;
  cargoPrice: number;
  serviceFee: number;
  commissionRate: number;
  commission: number;
  installmentCount: number;
  installmentFee: number;
  totalPrice: number;
  isFreeShippingCoupon: boolean;
};

/** A saved address enriched with the location IDs checkout needs (cargo + Garanti). */
export type CheckoutAddress = {
  id: number;
  title: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string;
  addressLine: string;
  zipCode: string;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  neighbourhoodId: number;
  neighbourhoodName: string;
  /** The user's default delivery address (web `is_default === 1`). */
  isDefault: boolean;
  /** The user's default invoice/billing address (web `is_invoice === 1`). */
  isInvoice: boolean;
};

/** Raw card field values held only in memory while the card form is open. */
export type CardFormValues = {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  owner: string;
};

/** Garanti 3D Secure form fields returned by `/payment-router` for the WebView form. */
export type GarantiFormData = {
  gatewayUrl: string;
  orderId: string;
  amount: string;
  currency: string;
  type: string;
  hashedData: string;
  terminalId: string;
  merchantId: string;
  provUserId: string;
  storeKey: string;
  successUrl: string;
  errorUrl: string;
  customerIpAddress: string;
  mode: string;
  apiVersion: string;
  installmentCount: number;
};

/** Minimal order summary shown on the success / pending screens. */
export type OrderDetails = {
  orderId?: string;
  orderNo: string;
  totalPrice: number;
};
