import { useMemo, useState } from 'react';
import { REFUND_METHOD_GIFT_VOUCHER, resolveRefundMethod } from '../utils/refund-method';
import { RefundMethod } from '@/types/order.types';

// Stable reference so the memo below does not re-run on every render.
const NO_METHODS: RefundMethod[] = [];

/**
 * Owns the refund-method choice (IBAN vs gift voucher) for the return flow.
 * Only pay-on-delivery orders offer it; card-paid orders pass `shouldShow=false`
 * and nothing is shown or submitted. When the list is empty or failed to load the
 * selector stays hidden and no id is sent — the backend then defaults to IBAN.
 */
export function useRefundMethod(shouldShow: boolean, refundMethods: RefundMethod[]) {
  const [pickedId, setPickedId] = useState<number | null>(null);

  const methods = shouldShow ? refundMethods : NO_METHODS;
  const selected = useMemo(() => resolveRefundMethod(methods, pickedId), [methods, pickedId]);

  return {
    methods,
    selected,
    selectedId: selected?.id ?? null,
    select: setPickedId,
    /** A single method needs no UI; the screen then looks exactly as before. */
    showSelector: methods.length > 1,
    isGiftVoucher: selected?.code === REFUND_METHOD_GIFT_VOUCHER,
  };
}

export type UseRefundMethod = ReturnType<typeof useRefundMethod>;
