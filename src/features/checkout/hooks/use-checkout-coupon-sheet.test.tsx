import { act, renderHook } from '@testing-library/react-native';
import { useCheckoutCouponSheet } from './use-checkout-coupon-sheet';

describe('useCheckoutCouponSheet', () => {
  it('closes the sheet and clears the typed code once the coupon is applied', async () => {
    const onApplyCoupon = jest.fn().mockResolvedValue(true);
    const { result } = renderHook(() => useCheckoutCouponSheet(onApplyCoupon));

    act(() => {
      result.current.open();
      result.current.setCode('  yaz50 ');
    });
    await act(async () => {
      await result.current.applyTypedCode();
    });

    expect(onApplyCoupon).toHaveBeenCalledWith('yaz50');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.code).toBe('');
  });

  it('keeps the sheet open with the typed code when the coupon is rejected', async () => {
    const onApplyCoupon = jest.fn().mockResolvedValue(false);
    const { result } = renderHook(() => useCheckoutCouponSheet(onApplyCoupon));

    act(() => {
      result.current.open();
      result.current.setCode('HATALI');
    });
    await act(async () => {
      await result.current.applyTypedCode();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.code).toBe('HATALI');
  });

  it('does not call the API for an empty code', async () => {
    const onApplyCoupon = jest.fn();
    const { result } = renderHook(() => useCheckoutCouponSheet(onApplyCoupon));

    await act(async () => {
      await result.current.applyCoupon('   ');
    });

    expect(onApplyCoupon).not.toHaveBeenCalled();
  });
});
