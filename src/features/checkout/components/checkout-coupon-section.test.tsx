import { ComponentProps } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutCouponSection } from './checkout-coupon-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AppliedCoupon } from '@/types/checkout.types';
import { Coupon } from '@/types/coupon.types';

type CheckoutCouponSectionProps = ComponentProps<typeof CheckoutCouponSection>;

const availableCoupon: Coupon = {
  id: 1,
  name: 'Yaz indirimi',
  description: null,
  couponCode: 'SUMMER25',
  discountType: 'fixed',
  discountValue: 25,
  minOrderAmount: null,
  maxDiscountAmount: null,
  minItemCount: null,
  startDate: '2026-06-01',
  endDate: '2026-09-01',
  isUserSpecific: false,
  isCombinable: false,
};

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
    couponError: null,
    couponInput: '',
    coupons: [],
    isApplyingCoupon: false,
    isCouponsLoading: false,
    isRemovingCoupon: false,
    onApplyCoupon: jest.fn(),
    onCouponInputChange: jest.fn(),
    onRemoveCoupon: jest.fn(),
    ...overrides,
  };
}

describe('CheckoutCouponSection', () => {
  it('renders the empty coupon placeholder as one ellipsized line', () => {
    renderWithTamagui(<CheckoutCouponSection {...makeProps()} />);

    const input = screen.getByLabelText('Kupon kodu');
    const placeholder = screen.getByText('Kupon Kodu (Zorunlu Değildir)', {
      includeHiddenElements: true,
    });

    expect(input.props.placeholder).toBe('');
    expect(placeholder.props.ellipsizeMode).toBe('tail');
    expect(placeholder.props.numberOfLines).toBe(1);
  });

  it('hides the placeholder overlay when a coupon value exists', () => {
    renderWithTamagui(<CheckoutCouponSection {...makeProps({ couponInput: 'SUMMER25' })} />);

    expect(screen.queryByText('Kupon Kodu (Zorunlu Değildir)')).toBeNull();
  });

  it('stops coupon code editing while the checkout is locked', () => {
    renderWithTamagui(
      <CheckoutCouponSection {...makeProps({ couponInput: 'SUMMER25', disabled: true })} />,
    );

    expect(screen.getByLabelText('Kupon kodu').props.editable).toBe(false);
  });

  it('ignores an available-coupon press while the checkout is locked', () => {
    const onApplyCoupon = jest.fn();
    renderWithTamagui(
      <CheckoutCouponSection
        {...makeProps({ coupons: [availableCoupon], disabled: true, onApplyCoupon })}
      />,
    );

    fireEvent.press(screen.getByLabelText('SUMMER25 kuponunu uygula'));

    expect(onApplyCoupon).not.toHaveBeenCalled();
  });

  it('ignores a remove press while the checkout is locked', () => {
    const onRemoveCoupon = jest.fn();
    renderWithTamagui(
      <CheckoutCouponSection
        {...makeProps({ appliedCoupon: appliedCoupon, disabled: true, onRemoveCoupon })}
      />,
    );

    fireEvent.press(screen.getByLabelText('Kuponu kaldır'));

    expect(onRemoveCoupon).not.toHaveBeenCalled();
  });
});
