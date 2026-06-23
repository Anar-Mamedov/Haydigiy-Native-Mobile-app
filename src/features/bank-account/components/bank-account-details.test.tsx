import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { BankAccountDetails } from './bank-account-details';
import { BANK_ACCOUNT_DETAILS } from '../data/bank-account';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

describe('BankAccountDetails', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders every bank-account field label and value', () => {
    renderWithTamagui(<BankAccountDetails />);

    for (const field of BANK_ACCOUNT_DETAILS) {
      expect(screen.getByText(field.label)).toBeTruthy();
      expect(screen.getByText(field.value)).toBeTruthy();
    }
  });

  it('keeps the values readable in dark theme', () => {
    renderWithTamagui(<BankAccountDetails />, 'dark');

    expect(screen.getByText('IBAN')).toBeTruthy();
    expect(screen.getByText('TR48 0011 1000 0000 0104 5382 90')).toBeTruthy();
  });

  it('copies the spaceless IBAN and shows feedback when the IBAN row is tapped', async () => {
    renderWithTamagui(<BankAccountDetails />);

    fireEvent.press(screen.getByLabelText('IBAN kopyala'));

    await waitFor(() =>
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('TR480011100000000104538290'),
    );
    await waitFor(() => expect(screen.getByText('Kopyalandı')).toBeTruthy());
  });

  it('does not make non-copyable rows pressable', () => {
    renderWithTamagui(<BankAccountDetails />);

    expect(screen.queryByLabelText('BANKA kopyala')).toBeNull();
    expect(screen.queryByLabelText('HESAP ADI kopyala')).toBeNull();
  });
});
