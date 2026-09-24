import { act, renderHook } from '@testing-library/react-native';
import { CardFormController, useCardForm } from './use-card-form';
import { useInstallmentPlansQuery } from '../api/checkout.queries';

jest.mock('../api/checkout.queries', () => ({
  useInstallmentPlansQuery: jest.fn(),
}));

const mockedUseInstallmentPlansQuery = useInstallmentPlansQuery as jest.MockedFunction<
  typeof useInstallmentPlansQuery
>;

const threeInstallments = [
  { installment: 3, ratio: 5, total: 3150, perMonth: 1050 },
];

describe('useCardForm price refresh', () => {
  it('preserves the selected installment while plans for the new total are loading', () => {
    mockedUseInstallmentPlansQuery.mockReturnValue({
      data: threeInstallments,
      isFetching: false,
    } as ReturnType<typeof useInstallmentPlansQuery>);

    const { result, rerender } = renderHook<
      CardFormController,
      { amount: number }
    >(
      ({ amount }) => useCardForm(amount, true),
      { initialProps: { amount: 3000 } },
    );

    act(() => {
      result.current.selectInstallment(3);
    });
    expect(result.current.selectedInstallment).toBe(3);

    mockedUseInstallmentPlansQuery.mockReturnValue({
      data: undefined,
      isFetching: true,
    } as ReturnType<typeof useInstallmentPlansQuery>);

    rerender({ amount: 3200 });

    expect(result.current.selectedInstallment).toBe(3);
    expect(result.current.selectedPlan).toBeNull();
    expect(result.current.isLoadingInstallments).toBe(true);

    mockedUseInstallmentPlansQuery.mockReturnValue({
      data: [{ installment: 3, ratio: 5, total: 3360, perMonth: 1120 }],
      isFetching: false,
    } as ReturnType<typeof useInstallmentPlansQuery>);

    rerender({ amount: 3200 });

    expect(result.current.selectedInstallment).toBe(3);
    expect(result.current.selectedPlan).toEqual(
      expect.objectContaining({ installment: 3, total: 3360 }),
    );
  });
});

describe('useCardForm Enpara cards', () => {
  // Regression: an Enpara BIN (5269/5351) used to switch the installment lookup off
  // and invalidate the card; the backend now routes these cards to İyzico.
  it('looks up installments and accepts a complete Enpara card', () => {
    mockedUseInstallmentPlansQuery.mockReturnValue({
      data: undefined,
      isFetching: false,
    } as ReturnType<typeof useInstallmentPlansQuery>);

    const { result } = renderHook(() => useCardForm(3000, true));

    act(() => {
      result.current.setNumber('5269 4242 4242 4242');
      result.current.setExpiryMonth('08');
      result.current.setExpiryYear('29');
      result.current.setCvv('123');
      result.current.setOwner('AHMET YILMAZ');
    });

    expect(mockedUseInstallmentPlansQuery).toHaveBeenLastCalledWith('52694242', 3000, true);
    expect(result.current.isValid).toBe(true);
  });
});
