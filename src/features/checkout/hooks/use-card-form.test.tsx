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
