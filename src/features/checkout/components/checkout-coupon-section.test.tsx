import { ComponentProps } from 'react';
import { screen } from '@testing-library/react-native';
import { CheckoutCouponSection } from './checkout-coupon-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';

type CheckoutCouponSectionProps = ComponentProps<typeof CheckoutCouponSection>;

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
});
