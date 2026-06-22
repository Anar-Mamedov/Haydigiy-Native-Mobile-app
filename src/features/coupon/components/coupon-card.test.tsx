import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { CouponCard } from './coupon-card';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Coupon } from '@/types/coupon.types';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

const baseCoupon: Coupon = {
  id: 1,
  name: 'Hoş Geldin',
  description: '10 TL indirim',
  couponCode: 'WELCOME10',
  discountType: 'fixed',
  discountValue: 50,
  minOrderAmount: 100,
  maxDiscountAmount: null,
  minItemCount: null,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  isUserSpecific: true,
  isCombinable: true,
};

describe('CouponCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the coupon code, discount label and conditional details', () => {
    renderWithTamagui(<CouponCard coupon={baseCoupon} />);

    expect(screen.getByText('WELCOME10')).toBeTruthy();
    expect(screen.getByText('50,00 TL')).toBeTruthy();
    expect(screen.getByText('Size özel')).toBeTruthy();
    expect(screen.getByText('Birleştirilebilir')).toBeTruthy();
    expect(screen.getByText('Minimum sipariş: 100,00 TL')).toBeTruthy();
  });

  it('marks a general coupon and hides the combinable chip when not combinable', () => {
    renderWithTamagui(
      <CouponCard coupon={{ ...baseCoupon, isUserSpecific: false, isCombinable: false }} />,
    );

    expect(screen.getByText('Genel')).toBeTruthy();
    expect(screen.queryByText('Birleştirilebilir')).toBeNull();
  });

  it('copies the coupon code to the clipboard when the copy button is pressed', async () => {
    renderWithTamagui(<CouponCard coupon={baseCoupon} />);

    fireEvent.press(screen.getByLabelText('WELCOME10 kupon kodunu kopyala'));

    await waitFor(() =>
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('WELCOME10'),
    );
  });
});
