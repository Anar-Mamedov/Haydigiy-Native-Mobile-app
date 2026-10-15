import { useMemo, useState } from 'react';
import { REFUND_METHOD_GIFT_VOUCHER, REFUND_METHOD_IBAN, resolveRefundMethod } from '../utils/refund-method';
import { RefundMethod } from '@/types/order.types';

// Stable reference so the memo below does not re-run on every render.
const NO_METHODS: RefundMethod[] = [];

/**
 * Owns the refund-method choice (IBAN vs coupon) for the return flow.
 * Only pay-on-delivery orders offer it; card-paid orders pass `shouldShow=false`
 * and nothing is shown or submitted. Whenever methods are offered the user must
 * pick one explicitly (web parity) — nothing is preselected. When the list comes
 * back empty or fails to load there is nothing to pick: the selector stays hidden,
 * no id is sent and the IBAN is still collected, because the backend then
 * defaults to IBAN.
 */
export function useRefundMethod(shouldShow: boolean, refundMethods: RefundMethod[], isLoading: boolean) {
  const [pickedId, setPickedId] = useState<number | null>(null);

  const methods = shouldShow ? refundMethods : NO_METHODS;
  const selected = useMemo(() => resolveRefundMethod(methods, pickedId), [methods, pickedId]);
  const isUnavailable = shouldShow && !isLoading && methods.length === 0;
  const isIban = selected?.code === REFUND_METHOD_IBAN;

  return {
    methods,
    selected,
    selectedId: selected?.id ?? null,
    select: setPickedId,
    /** Even a single method is shown so the choice is always made explicitly. */
    showSelector: methods.length > 0,
    isIban,
    isGiftVoucher: selected?.code === REFUND_METHOD_GIFT_VOUCHER,
    /** IBAN is asked for only when the user picked it, or when there was nothing to pick. */
    requiresIban: shouldShow && (isIban || isUnavailable),
    /** False while a method is offered but the user has not picked one yet. */
    hasRequiredSelection: !shouldShow || isUnavailable || selected !== null,
  };
}

export type UseRefundMethod = ReturnType<typeof useRefundMethod>;
