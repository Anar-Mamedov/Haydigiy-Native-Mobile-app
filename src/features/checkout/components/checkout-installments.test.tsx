import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { InstallmentPlan } from '@/types/checkout.types';
import { CheckoutInstallments } from './checkout-installments';

const plans: InstallmentPlan[] = [
  { installment: 3, ratio: 0, total: 300, perMonth: 100, isInterestFree: true },
  { installment: 6, ratio: 0.05, total: 315, perMonth: 52.5, isInterestFree: false },
];

describe('CheckoutInstallments', () => {
  it('selects an installment plan when the checkout is not locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutInstallments
        installmentPlans={plans}
        isLoading={false}
        onSelect={onSelect}
        selectedInstallment={1}
        singlePaymentTotal={300}
      />,
    );

    fireEvent.press(screen.getByLabelText('3 taksit, peşin fiyatına'));

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('ignores single-payment and installment presses while the checkout is locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutInstallments
        disabled
        installmentPlans={plans}
        isLoading={false}
        onSelect={onSelect}
        selectedInstallment={3}
        singlePaymentTotal={300}
      />,
    );

    fireEvent.press(screen.getByLabelText('Tek çekim'));
    fireEvent.press(screen.getByLabelText('6 taksit'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it.each(['light', 'dark'] as const)('tags only interest-free plans with "Peşin Fiyatına" in the %s theme', (theme) => {
    renderWithTamagui(
      <CheckoutInstallments
        installmentPlans={plans}
        isLoading={false}
        onSelect={jest.fn()}
        selectedInstallment={1}
        singlePaymentTotal={300}
      />,
      theme,
    );

    expect(screen.getAllByTestId('installment-interest-free-tag')).toHaveLength(1);
    expect(screen.getByText('Peşin Fiyatına')).toBeTruthy();
    expect(screen.getByLabelText('6 taksit')).toBeTruthy();
  });
});
