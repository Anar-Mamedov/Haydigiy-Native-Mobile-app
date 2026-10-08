import { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutCouponSection } from './checkout-coupon-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AppliedCoupon } from '@/types/checkout.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'checkout-coupon-sheet' }, children);
  };
  SheetRoot.Overlay = function SheetOverlay() {
    return null;
  };
  SheetRoot.Frame = function SheetFrame({ children }: any) {
    return React.createElement(View, null, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

type CheckoutCouponSectionProps = ComponentProps<typeof CheckoutCouponSection>;

const appliedCoupon: AppliedCoupon = {
  code: 'SUMMER25',
  discountType: 'fixed',
  discountValue: 25,
  discount: 25,
  isFreeShipping: false,
};

function makeProps(overrides: Partial<CheckoutCouponSectionProps> = {}): CheckoutCouponSectionProps {
  return {
    appliedCoupon: null,
    cart: { subtotal: 300, itemCount: 2 },
    couponError: null,
    coupons: [],
    isApplyingCoupon: false,
    isCouponsLoading: false,
    isRemovingCoupon: false,
    onApplyCoupon: jest.fn().mockResolvedValue(true),
    onRemoveCoupon: jest.fn(),
    ...overrides,
  };
}

describe('CheckoutCouponSection', () => {
  it('invites the user to pick a coupon when none is applied', () => {
    renderWithTamagui(<CheckoutCouponSection {...makeProps()} />);

    expect(screen.getByText('Kuponlarım')).toBeTruthy();
    expect(screen.getByText('+ Kupon Kodu Ekle')).toBeTruthy();
    expect(
      screen.getByText('Kupon avantajından yararlanmak için bir kupon seç veya kod ekle.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('checkout-coupon-sheet')).toBeNull();
  });

  it('opens the coupons sheet from the header and from "Kuponları Gör"', () => {
    const { unmount } = renderWithTamagui(<CheckoutCouponSection {...makeProps()} />);

    fireEvent.press(screen.getByLabelText('Kuponlarım'));
    expect(screen.getByTestId('checkout-coupon-sheet')).toBeTruthy();
    unmount();

    renderWithTamagui(<CheckoutCouponSection {...makeProps()} />);
    fireEvent.press(screen.getByLabelText('Kuponları Gör'));
    expect(screen.getByTestId('checkout-coupon-sheet')).toBeTruthy();
  });

  it('shows the applied coupon with its discount and removes it', () => {
    const onRemoveCoupon = jest.fn();
    renderWithTamagui(<CheckoutCouponSection {...makeProps({ appliedCoupon, onRemoveCoupon })} />);

    expect(screen.getByText('SUMMER25')).toBeTruthy();
    expect(screen.getByText('UYGULANDI')).toBeTruthy();
    expect(screen.getByText('₺25,00 İndirim')).toBeTruthy();
    expect(screen.getByText('Kupon indirimin sepetine yansıtıldı.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Uygulanan kuponu kaldır'));
    expect(onRemoveCoupon).toHaveBeenCalledTimes(1);
  });

  it('ignores a remove press while the checkout is locked', () => {
    const onRemoveCoupon = jest.fn();
    renderWithTamagui(
      <CheckoutCouponSection {...makeProps({ appliedCoupon, disabled: true, onRemoveCoupon })} />,
    );

    fireEvent.press(screen.getByLabelText('Uygulanan kuponu kaldır'));

    expect(onRemoveCoupon).not.toHaveBeenCalled();
  });

  it('surfaces a coupon error on the card while the sheet is closed', () => {
    renderWithTamagui(
      <CheckoutCouponSection {...makeProps({ couponError: 'Kupon bu ödeme yönteminde geçersiz.' })} />,
    );

    expect(screen.getByText('Kupon bu ödeme yönteminde geçersiz.')).toBeTruthy();
  });

  describe('coupon worth more than the cart', () => {
    const WARNING =
      'Kupon tutarının sepet toplamını aşan kısmı kullanılamaz. Kalan tutar ise kullanılamayacaktır.';
    const bigCoupon: AppliedCoupon = { ...appliedCoupon, discountValue: 500, discount: 300 };

    it('warns when a fixed coupon exceeds the order subtotal', () => {
      renderWithTamagui(
        <CheckoutCouponSection
          {...makeProps({
            appliedCoupon: bigCoupon,
            cart: { subtotal: 300, itemCount: 1 },
            orderSubtotal: 300,
          })}
        />,
      );

      expect(screen.getByText(WARNING)).toBeTruthy();
    });

    it('compares against the order summary subtotal, not the cart, when it is known', () => {
      renderWithTamagui(
        <CheckoutCouponSection
          {...makeProps({
            appliedCoupon: bigCoupon,
            cart: { subtotal: 300, itemCount: 1 },
            orderSubtotal: 600,
          })}
        />,
      );

      expect(screen.queryByText(WARNING)).toBeNull();
    });

    // Özet yenilenirken uyarı yanıp sönmesin diye sepet ara toplamına düşülür.
    it('falls back to the cart subtotal while the order summary reloads', () => {
      renderWithTamagui(
        <CheckoutCouponSection
          {...makeProps({
            appliedCoupon: bigCoupon,
            cart: { subtotal: 300, itemCount: 1 },
            orderSubtotal: null,
          })}
        />,
      );

      expect(screen.getByText(WARNING)).toBeTruthy();
    });

    it('stays hidden for a coupon the cart covers or without a coupon', () => {
      const { unmount } = renderWithTamagui(
        <CheckoutCouponSection {...makeProps({ appliedCoupon, orderSubtotal: 300 })} />,
      );
      expect(screen.queryByText(WARNING)).toBeNull();
      unmount();

      renderWithTamagui(<CheckoutCouponSection {...makeProps({ orderSubtotal: 0 })} />);
      expect(screen.queryByText(WARNING)).toBeNull();
    });

    it('keeps the warning readable in the dark theme', () => {
      renderWithTamagui(
        <CheckoutCouponSection {...makeProps({ appliedCoupon: bigCoupon, orderSubtotal: 100 })} />,
        'dark',
      );

      expect(screen.getByText(WARNING)).toBeTruthy();
    });
  });

  it('keeps the card labels readable in the dark theme', () => {
    renderWithTamagui(<CheckoutCouponSection {...makeProps({ appliedCoupon })} />, 'dark');

    expect(screen.getByText('Kuponlarım')).toBeTruthy();
    expect(screen.getByText('SUMMER25')).toBeTruthy();
    expect(screen.getByLabelText('Uygulanan kuponu kaldır')).toBeTruthy();
  });
});
