import { fireEvent, screen } from '@testing-library/react-native';
import { RefundMethodSection } from './refund-method-section';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { UseRefundMethod } from '../hooks/use-refund-method';

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { Text, View } = jest.requireActual('react-native');

  return {
    AppSelect: ({ label, options, onValueChange, placeholder, value }: any) =>
      React.createElement(
        View,
        { accessibilityLabel: label, testID: 'refund-method-select', placeholder, value },
        options.map((option: { label: string; value: number }) =>
          React.createElement(Text, { key: option.value, onPress: () => onValueChange(option.value) }, option.label),
        ),
      ),
    SectionCard: ({ children }: any) => React.createElement(View, null, children),
  };
});

const IBAN = { id: 1, name: 'IBAN', code: 'iban' };
const COUPON = { id: 2, name: 'Kupon', code: 'gift_voucher' };

function makeRefund(overrides: Partial<UseRefundMethod> = {}): UseRefundMethod {
  return {
    methods: [IBAN, COUPON],
    selected: null,
    selectedId: null,
    select: jest.fn(),
    showSelector: true,
    isIban: false,
    isGiftVoucher: false,
    requiresIban: false,
    hasRequiredSelection: false,
    ...overrides,
  };
}

describe('RefundMethodSection', () => {
  it.each(['light', 'dark'] as const)(
    'renders a required, empty select with the web option wording (%s theme)',
    (theme) => {
      renderWithTamagui(<RefundMethodSection refund={makeRefund()} />, theme);

      expect(screen.getByText(/Geri Ödeme Yöntemi/)).toBeTruthy();
      expect(screen.getByText('*')).toBeTruthy();
      const select = screen.getByTestId('refund-method-select');
      expect(select.props.placeholder).toBe('Seçiniz');
      expect(select.props.value).toBeNull();
      expect(screen.getByText('İademin IBAN’ıma yapılmasını istiyorum')).toBeTruthy();
      expect(screen.getByText('İademin Kupon olarak tanımlanmasını istiyorum')).toBeTruthy();
    },
  );

  it('selects the tapped method and lets the screen clear the IBAN error', () => {
    const refund = makeRefund();
    const onSelect = jest.fn();
    renderWithTamagui(<RefundMethodSection onSelect={onSelect} refund={refund} />);

    fireEvent.press(screen.getByText('İademin Kupon olarak tanımlanmasını istiyorum'));

    expect(refund.select).toHaveBeenCalledWith(COUPON.id);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('warns that no IBAN payment will be made only while the coupon is selected', () => {
    const { rerender } = renderWithTamagui(<RefundMethodSection refund={makeRefund({ isIban: true, selectedId: 1 })} />);
    expect(screen.queryByTestId('refund-method-coupon-notice')).toBeNull();

    rerender(<RefundMethodSection refund={makeRefund({ isGiftVoucher: true, selectedId: 2 })} />);

    expect(screen.getByTestId('refund-method-coupon-notice')).toBeTruthy();
    expect(screen.getByText('IBAN’ınıza herhangi bir ödeme yapılmayacaktır.')).toBeTruthy();
  });

  it('shows the load error under the select', () => {
    renderWithTamagui(<RefundMethodSection error="İade yöntemleri yüklenemedi." refund={makeRefund()} />);

    expect(screen.getByText('İade yöntemleri yüklenemedi.')).toBeTruthy();
  });
});
