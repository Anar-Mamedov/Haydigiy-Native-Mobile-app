import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnConditionsNotice } from './return-conditions-notice';
import { RETURN_CONDITION_HIGHLIGHTS } from '../data/return-policy-content';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ReturnConditionsNotice', () => {
  it('lists the four web return conditions under the "İade Koşulları" title', () => {
    renderWithTamagui(<ReturnConditionsNotice onShowAllConditions={jest.fn()} />);

    expect(screen.getByText('İade Koşulları')).toBeTruthy();
    expect(RETURN_CONDITION_HIGHLIGHTS).toHaveLength(4);
    RETURN_CONDITION_HIGHLIGHTS.forEach((condition) => {
      expect(screen.getByText(condition)).toBeTruthy();
    });
    expect(
      screen.getByText(
        'Anlaşmalı kargo şirketi dışında bir kargo ile gönderilen iadelerin kargo ücreti size aittir.',
      ),
    ).toBeTruthy();
  });

  it('opens the full conditions from the link', () => {
    const onShowAllConditions = jest.fn();
    renderWithTamagui(<ReturnConditionsNotice onShowAllConditions={onShowAllConditions} />);

    fireEvent.press(screen.getByLabelText('Tüm iptal ve iade koşullarını inceleyin'));
    expect(onShowAllConditions).toHaveBeenCalledTimes(1);
  });

  it('keeps the title, conditions and link visible in dark mode', () => {
    renderWithTamagui(<ReturnConditionsNotice onShowAllConditions={jest.fn()} />, 'dark');

    expect(screen.getByText('İade Koşulları')).toBeTruthy();
    expect(screen.getByText(RETURN_CONDITION_HIGHLIGHTS[0] as string)).toBeTruthy();
    expect(screen.getByLabelText('Tüm iptal ve iade koşullarını inceleyin')).toBeTruthy();
  });
});
