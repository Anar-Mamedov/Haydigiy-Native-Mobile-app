import { act, renderHook } from '@testing-library/react-native';
import { useRefundMethod } from './use-refund-method';
import { RefundMethod } from '@/types/order.types';

const IBAN: RefundMethod = { id: 1, name: 'IBAN', code: 'iban' };
const GIFT_VOUCHER: RefundMethod = { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' };

describe('useRefundMethod', () => {
  it('offers nothing for a card-paid order even when methods loaded', () => {
    const { result } = renderHook(() => useRefundMethod(false, [IBAN, GIFT_VOUCHER]));

    expect(result.current.methods).toEqual([]);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.showSelector).toBe(false);
    expect(result.current.isGiftVoucher).toBe(false);
  });

  it('starts on IBAN and only shows the selector with more than one method', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN, GIFT_VOUCHER]));

    expect(result.current.selectedId).toBe(IBAN.id);
    expect(result.current.showSelector).toBe(true);
    expect(result.current.isGiftVoucher).toBe(false);
  });

  // Tek yöntem varsa seçim sunmanın anlamı yok; ekran bugünkü haliyle kalır.
  it('hides the selector when a single method comes back', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN]));

    expect(result.current.showSelector).toBe(false);
    expect(result.current.selectedId).toBe(IBAN.id);
  });

  it('hides the selector and selects nothing when the list is empty', () => {
    const { result } = renderHook(() => useRefundMethod(true, []));

    expect(result.current.showSelector).toBe(false);
    expect(result.current.selectedId).toBeNull();
  });

  it('flags the gift voucher once it is picked', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN, GIFT_VOUCHER]));

    act(() => result.current.select(GIFT_VOUCHER.id));

    expect(result.current.selectedId).toBe(GIFT_VOUCHER.id);
    expect(result.current.isGiftVoucher).toBe(true);
  });

  it('falls back to IBAN when the picked method leaves the list', () => {
    const { rerender, result } = renderHook(
      ({ methods }: { methods: RefundMethod[] }) => useRefundMethod(true, methods),
      { initialProps: { methods: [IBAN, GIFT_VOUCHER] } },
    );

    act(() => result.current.select(GIFT_VOUCHER.id));
    rerender({ methods: [IBAN] });

    expect(result.current.selectedId).toBe(IBAN.id);
    expect(result.current.isGiftVoucher).toBe(false);
  });
});
