import { screen } from '@testing-library/react-native';
import { ReturnGiftVoucherCard } from './return-gift-voucher-card';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReturnPaymentInfo } from '@/types/order.types';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

function makeInfo(overrides: Partial<ReturnPaymentInfo> = {}): ReturnPaymentInfo {
  return {
    type: 'gift_voucher',
    message: 'İade kuponunuz oluşturuldu',
    amount: 750,
    couponCode: 'IADEHG123456',
    expiresAt: '2027-02-07',
    refundMethodCode: 'gift_voucher',
    ...overrides,
  };
}

describe('ReturnGiftVoucherCard', () => {
  it('renders nothing without refund info', () => {
    renderWithTamagui(<ReturnGiftVoucherCard info={null} />);

    expect(screen.queryByTestId('return-gift-voucher-card')).toBeNull();
  });

  // IBAN iadelerinde kupon yok; kart bu durumda hiç görünmemeli.
  it('renders nothing for an IBAN refund', () => {
    renderWithTamagui(
      <ReturnGiftVoucherCard info={makeInfo({ type: 'iban', refundMethodCode: 'iban' })} />,
    );

    expect(screen.queryByTestId('return-gift-voucher-card')).toBeNull();
  });

  it('shows the coupon code, amount and expiry for a gift-voucher refund', () => {
    renderWithTamagui(<ReturnGiftVoucherCard info={makeInfo()} />);

    expect(screen.getByText('İade kuponunuz oluşturuldu')).toBeTruthy();
    expect(screen.getByText('IADEHG123456')).toBeTruthy();
    expect(screen.getByText('Kupon tutarı: 750.00 TL')).toBeTruthy();
    expect(screen.getByText('Son kullanma: 2027-02-07')).toBeTruthy();
  });

  // Kupon WMS onayından sonra üretiliyor; öncesinde kod/tutar boş gelebilir.
  it('falls back to a default message and omits missing details', () => {
    renderWithTamagui(
      <ReturnGiftVoucherCard
        info={makeInfo({ amount: null, couponCode: null, expiresAt: null, message: null })}
      />,
    );

    expect(screen.getByText('İade kuponunuz oluşturuldu')).toBeTruthy();
    expect(screen.queryByText('KUPON KODU')).toBeNull();
    expect(screen.queryByText(/Kupon tutarı/)).toBeNull();
    expect(screen.queryByText(/Son kullanma/)).toBeNull();
  });

  it('stays readable in the dark theme', () => {
    renderWithTamagui(<ReturnGiftVoucherCard info={makeInfo()} />, 'dark');

    expect(screen.getByText('IADEHG123456')).toBeTruthy();
    expect(screen.getByText('Kupon tutarı: 750.00 TL')).toBeTruthy();
  });
});
