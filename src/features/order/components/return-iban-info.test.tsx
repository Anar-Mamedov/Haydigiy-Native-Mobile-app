import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReturnIbanInfo } from './return-iban-info';

describe('ReturnIbanInfo', () => {
  it.each(['light', 'dark'] as const)('shows the holder and the grouped IBAN in the %s theme', (theme) => {
    renderWithTamagui(
      <ReturnIbanInfo refundIban={{ iban: 'TR120006200000000123456789', ibanName: 'Ayşe Yılmaz' }} />,
      theme,
    );

    expect(screen.getByText(/Ayşe Yılmaz/)).toBeTruthy();
    expect(screen.getByText(/TR12 0006 2000 0000 0123 4567 89/)).toBeTruthy();
    expect(screen.getByText('IBAN sahibi:')).toBeTruthy();
  });

  it('shows only the fields that were sent', () => {
    renderWithTamagui(<ReturnIbanInfo refundIban={{ iban: null, ibanName: 'Ayşe Yılmaz' }} />);

    expect(screen.getByText('IBAN sahibi:')).toBeTruthy();
    expect(screen.queryByText('IBAN:')).toBeNull();
  });

  it('renders nothing without an IBAN or holder', () => {
    renderWithTamagui(<ReturnIbanInfo refundIban={{ iban: null, ibanName: null }} />);

    expect(screen.queryByTestId('return-iban-info')).toBeNull();
  });
});
