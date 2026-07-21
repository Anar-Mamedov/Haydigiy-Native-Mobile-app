/**
 * Builds the provisional amount sent to `/order/token` and used for installment
 * lookup prerequisites. Displayed and charged amounts never use this result;
 * they come back from the API-authoritative order-token summary.
 */

export type OrderInstallmentSelection = {
  installment: number;
  perMonth: number;
};

export type OrderTotalsInput = {
  subtotal: number;
  userDiscount: number;
  campaignDiscount?: number;
  couponDiscount: number;
  isFreeShippingCoupon: boolean;
  hasFreeShipping: boolean;
  cargoPrice: number;
  serviceFee: number;
  commissionRate: number;
  installment?: OrderInstallmentSelection | null;
};

export type OrderTotals = {
  effectiveCouponDiscount: number;
  effectiveCargoPrice: number;
  serviceFee: number;
  commission: number;
  installmentFee: number;
  singlePaymentTotal: number;
  finalTotal: number;
};

/**
 * Free-shipping coupons can return their discount on the `discount` field while
 * also zeroing the cargo line; subtracting both would double-count. Only the part
 * of the discount above the cargo price counts as a product discount.
 */
export function getEffectiveCouponDiscount(
  couponDiscount: number,
  isFreeShippingCoupon: boolean,
  cargoPrice: number,
): number {
  const discount = Math.max(0, couponDiscount || 0);
  if (!isFreeShippingCoupon) {
    return discount;
  }
  return Math.max(0, discount - Math.max(0, cargoPrice || 0));
}

/**
 * Order of operations matches the backend order calculation: subtotal → user
 * discount → campaign cart discount → coupon discount, then fees + cargo +
 * commission, then installment fee.
 */
export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  const cargoPrice = Math.max(0, input.cargoPrice || 0);
  const effectiveCargoPrice = input.hasFreeShipping ? 0 : cargoPrice;
  const effectiveCouponDiscount = getEffectiveCouponDiscount(
    input.couponDiscount,
    input.isFreeShippingCoupon,
    cargoPrice,
  );
  const serviceFee = input.serviceFee || 0;

  const baseTotal = Math.max(0, (input.subtotal || 0) - (input.userDiscount || 0));
  const baseTotalAfterCampaign = Math.max(0, baseTotal - Math.max(0, input.campaignDiscount || 0));
  const baseTotalAfterCoupon = Math.max(0, baseTotalAfterCampaign - effectiveCouponDiscount);

  // Single-payment (Tek Çekim) amount: only subtotal + cargo (no commission/fee).
  const singlePaymentTotal = baseTotalAfterCoupon + effectiveCargoPrice;

  const subtotalWithFeesAndCargo = baseTotalAfterCoupon + serviceFee + effectiveCargoPrice;
  const commission = (subtotalWithFeesAndCargo * (input.commissionRate || 0)) / 100;
  const baseFullPaymentAmount = subtotalWithFeesAndCargo + commission;

  let installmentFee = 0;
  let finalTotal = baseFullPaymentAmount;

  if (input.installment && input.installment.installment > 1) {
    const installmentTotal = input.installment.installment * input.installment.perMonth;
    installmentFee = installmentTotal - baseFullPaymentAmount;
    finalTotal = installmentTotal;
  }

  return {
    effectiveCouponDiscount,
    effectiveCargoPrice,
    serviceFee,
    commission,
    installmentFee,
    singlePaymentTotal,
    finalTotal,
  };
}
