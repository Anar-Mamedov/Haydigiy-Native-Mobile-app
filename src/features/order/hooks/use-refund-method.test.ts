import { act, renderHook } from '@testing-library/react-native';
import { useRefundMethod } from './use-refund-method';
import { RefundMethod } from '@/types/order.types';

const IBAN: RefundMethod = { id: 1, name: 'IBAN', code: 'iban' };
const GIFT_VOUCHER: RefundMethod = { id: 2, name: 'Kupon', code: 'gift_voucher' };

describe('useRefundMethod', () => {
  it('offers nothing for a card-paid order even when methods loaded', () => {
    const { result } = renderHook(() => useRefundMethod(false, [IBAN, GIFT_VOUCHER], false));

    expect(result.current.methods).toEqual([]);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.showSelector).toBe(false);
    expect(result.current.isGiftVoucher).toBe(false);
    expect(result.current.requiresIban).toBe(false);
    expect(result.current.hasRequiredSelection).toBe(true);
  });

  // Web paritesi: zorunlu tercih, varsayılan seçim yok.
  it('starts with nothing picked and requires a choice', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN, GIFT_VOUCHER], false));

    expect(result.current.selectedId).toBeNull();
    expect(result.current.showSelector).toBe(true);
    expect(result.current.requiresIban).toBe(false);
    expect(result.current.hasRequiredSelection).toBe(false);
  });

  it('shows the selector even when a single method comes back', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN], false));

    expect(result.current.showSelector).toBe(true);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.hasRequiredSelection).toBe(false);
  });

  it('requires the IBAN once the IBAN method is picked', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN, GIFT_VOUCHER], false));

    act(() => result.current.select(IBAN.id));

    expect(result.current.isIban).toBe(true);
    expect(result.current.requiresIban).toBe(true);
    expect(result.current.hasRequiredSelection).toBe(true);
  });

  it('flags the coupon and drops the IBAN once it is picked', () => {
    const { result } = renderHook(() => useRefundMethod(true, [IBAN, GIFT_VOUCHER], false));

    act(() => result.current.select(GIFT_VOUCHER.id));

    expect(result.current.selectedId).toBe(GIFT_VOUCHER.id);
    expect(result.current.isGiftVoucher).toBe(true);
    expect(result.current.requiresIban).toBe(false);
    expect(result.current.hasRequiredSelection).toBe(true);
  });

  it('waits without asking for the IBAN while the list is loading', () => {
    const { result } = renderHook(() => useRefundMethod(true, [], true));

    expect(result.current.showSelector).toBe(false);
    expect(result.current.requiresIban).toBe(false);
    expect(result.current.hasRequiredSelection).toBe(false);
  });

  // Seçilecek bir şey yoksa backend'in varsayılanı (IBAN) geçerli olur.
  it('falls back to the IBAN when the list comes back empty', () => {
    const { result } = renderHook(() => useRefundMethod(true, [], false));

    expect(result.current.showSelector).toBe(false);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.requiresIban).toBe(true);
    expect(result.current.hasRequiredSelection).toBe(true);
  });

  it('clears the choice when the picked method leaves the list', () => {
    const { rerender, result } = renderHook(
      ({ methods }: { methods: RefundMethod[] }) => useRefundMethod(true, methods, false),
      { initialProps: { methods: [IBAN, GIFT_VOUCHER] } },
    );

    act(() => result.current.select(GIFT_VOUCHER.id));
    rerender({ methods: [IBAN] });

    expect(result.current.selectedId).toBeNull();
    expect(result.current.isGiftVoucher).toBe(false);
    expect(result.current.hasRequiredSelection).toBe(false);
  });
});
