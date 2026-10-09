import { ComponentProps } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutCouponSheet } from './checkout-coupon-sheet';
import { getFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'checkout-coupon-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'checkout-coupon-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

type SheetProps = ComponentProps<typeof CheckoutCouponSheet>;

const DAY_MS = 86_400_000;

function makeCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    name: 'Yaz indirimi',
    description: null,
    couponCode: 'YAZ50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: null,
    maxDiscountAmount: null,
    minItemCount: null,
    startDate: new Date(Date.now() - 10 * DAY_MS).toISOString(),
    endDate: new Date(Date.now() + 30 * DAY_MS).toISOString(),
    isUserSpecific: false,
    isCombinable: false,
    ...overrides,
  };
}

function makeProps(overrides: Partial<SheetProps> = {}): SheetProps {
  return {
    open: true,
    onClose: jest.fn(),
    code: '',
    onCodeChange: jest.fn(),
    onApplyCode: jest.fn(),
    onApplyCoupon: jest.fn(),
    coupons: [],
    isCouponsLoading: false,
    appliedCoupon: null,
    couponError: null,
    isApplyingCoupon: false,
    cart: { subtotal: 300, itemCount: 2 },
    ...overrides,
  };
}

describe('CheckoutCouponSheet', () => {
  it('follows the keyboard-aware form sheet standard', () => {
    renderWithTamagui(<CheckoutCouponSheet {...makeProps()} />);

    const sheet = screen.getByTestId('checkout-coupon-sheet');
    expect(sheet.props.moveOnKeyboardChange).toBe(true);
    expect(sheet.props.snapPointsMode).toBe('fit');
    expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();

    const frame = screen.getByTestId('checkout-coupon-sheet-frame');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(frame.props.maxHeight).toBe(getFitSheetMaxHeight(Dimensions.get('window').height, 40));
    expect(screen.getByTestId('checkout-coupon-sheet-bottom-cover')).toBeTruthy();

    const scroll = screen.getByTestId('checkout-coupon-keyboard-aware-scroll');
    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.overScrollMode).toBe('never');
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');

    expect(screen.getByLabelText('Kupon Kodu')).toBeTruthy();
  });

  // Yüzde maxHeight fit modunda yok sayılıyordu; uzun kupon listesinde sheet ekranın tepesine
  // yapışıyor, iOS'ta başlık ve kapatma butonu durum çubuğunun altında kalıyordu.
  it('bounds the frame with an absolute height that clears the status bar', () => {
    renderWithTamagui(<CheckoutCouponSheet {...makeProps()} />);

    const { maxHeight } = screen.getByTestId('checkout-coupon-sheet-frame').props;
    expect(typeof maxHeight).toBe('number');
    expect(maxHeight).toBeLessThanOrEqual(Dimensions.get('window').height - 40);
  });

  // HMA-1: sheet başlıktan aşağı kaydırılarak da kapatılabilmeli (bottom snap point eklemeden).
  it('closes when the header is swiped down, without a bottom snap point', () => {
    const onClose = jest.fn();
    renderWithTamagui(<CheckoutCouponSheet {...makeProps({ onClose })} />);

    const header = screen.getByTestId('checkout-coupon-sheet-swipe-close');
    fireEvent(header, 'touchStart', { nativeEvent: { pageY: 100, timestamp: 1000 } });
    fireEvent(header, 'touchEnd', { nativeEvent: { pageY: 300, timestamp: 1400 } });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('checkout-coupon-sheet').props.dismissOnSnapToBottom).toBeUndefined();
  });

  it('applies the typed code only when a code is entered', () => {
    const onApplyCode = jest.fn();
    const { rerender } = renderWithTamagui(<CheckoutCouponSheet {...makeProps({ onApplyCode })} />);

    fireEvent.press(screen.getByText('Kuponu Uygula'));
    expect(onApplyCode).not.toHaveBeenCalled();

    rerender(<CheckoutCouponSheet {...makeProps({ code: 'YAZ50', onApplyCode })} />);
    fireEvent.press(screen.getByText('Kuponu Uygula'));
    expect(onApplyCode).toHaveBeenCalledTimes(1);
  });

  it('shows the coupon error inside the sheet', () => {
    renderWithTamagui(<CheckoutCouponSheet {...makeProps({ couponError: 'Kupon geçersiz.' })} />);

    expect(screen.getByText('Kupon geçersiz.')).toBeTruthy();
  });

  it('applies a selectable coupon and blocks one whose requirement is not met', () => {
    const onApplyCoupon = jest.fn();
    renderWithTamagui(
      <CheckoutCouponSheet
        {...makeProps({
          coupons: [
            makeCoupon(),
            makeCoupon({ id: 2, couponCode: 'BUYUK500', minOrderAmount: 500 }),
          ],
          onApplyCoupon,
        })}
      />,
    );

    fireEvent.press(screen.getByLabelText('BUYUK500 kuponu, Şart sağlanmadı'));
    expect(onApplyCoupon).not.toHaveBeenCalled();
    expect(screen.getByText('Alt Limit: ₺500,00')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('YAZ50 kuponu, Kodu Uygula'));
    expect(onApplyCoupon).toHaveBeenCalledWith('YAZ50');
  });

  it('marks the applied coupon and does not re-apply it', () => {
    const onApplyCoupon = jest.fn();
    const appliedCoupon: AppliedCoupon = {
      code: 'yaz50',
      discountType: 'fixed',
      discountValue: 50,
      discount: 50,
      isFreeShipping: false,
    };
    renderWithTamagui(
      <CheckoutCouponSheet {...makeProps({ appliedCoupon, coupons: [makeCoupon()], onApplyCoupon })} />,
    );

    fireEvent.press(screen.getByLabelText('YAZ50 kuponu, Uygulandı'));

    expect(screen.getByText('Uygulandı')).toBeTruthy();
    expect(onApplyCoupon).not.toHaveBeenCalled();
  });

  it('ignores coupon presses while the checkout is locked', () => {
    const onApplyCoupon = jest.fn();
    renderWithTamagui(
      <CheckoutCouponSheet {...makeProps({ coupons: [makeCoupon()], disabled: true, onApplyCoupon })} />,
    );

    fireEvent.press(screen.getByLabelText('YAZ50 kuponu, Kodu Uygula'));

    expect(onApplyCoupon).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Kupon Kodu').props.editable).toBe(false);
  });

  // Paragraph varsayılan 22 pt satır yüksekliği taşıyor; 28 pt tutar yazısında rakamların üstü
  // kesiliyordu ("%10", "₺5.309,99").
  it('gives the large ticket value enough line height so the digits are not clipped', () => {
    renderWithTamagui(
      <CheckoutCouponSheet
        {...makeProps({
          coupons: [
            makeCoupon({ discountType: 'percentage', discountValue: 10 }),
            makeCoupon({ id: 2, couponCode: 'HG224358083', discountValue: 5309.99 }),
          ],
        })}
      />,
    );

    for (const valueLabel of ['%10', '₺5.309,99']) {
      const style = StyleSheet.flatten(screen.getByText(valueLabel).props.style);
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize);
    }
  });

  it('shows the expiry badge in the last seven days', () => {
    renderWithTamagui(
      <CheckoutCouponSheet
        {...makeProps({
          coupons: [makeCoupon({ endDate: new Date(Date.now() + 2.5 * DAY_MS).toISOString() })],
        })}
      />,
    );

    expect(screen.getByText('Son 3 gün')).toBeTruthy();
  });

  it('renders the loading and empty states', () => {
    const { rerender } = renderWithTamagui(
      <CheckoutCouponSheet {...makeProps({ isCouponsLoading: true })} />,
    );
    expect(screen.getByText('Kuponlar yükleniyor...')).toBeTruthy();

    rerender(<CheckoutCouponSheet {...makeProps()} />);
    expect(screen.getByText('Şu an kullanabileceğin bir kupon bulunmuyor.')).toBeTruthy();
  });

  it('keeps the labels readable in the dark theme', () => {
    renderWithTamagui(<CheckoutCouponSheet {...makeProps({ coupons: [makeCoupon()] })} />, 'dark');

    expect(screen.getByText('Kuponlarım')).toBeTruthy();
    expect(screen.getByText('Kuponu Uygula')).toBeTruthy();
    expect(screen.getByText('Kodu Uygula')).toBeTruthy();
  });
});
