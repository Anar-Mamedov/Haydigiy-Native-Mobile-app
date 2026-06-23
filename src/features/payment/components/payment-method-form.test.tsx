import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { PaymentMethodForm } from './payment-method-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockAddMutate = jest.fn();
const mockUpdateMutate = jest.fn();

// The shared UI barrel pulls in app-header → expo-router; stub it. useFocusEffect
// is a no-op here (fields prefill from the form's defaultValues regardless of focus).
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/payment.mutations', () => ({
  useAddPaymentMethodMutation: () => ({ mutateAsync: mockAddMutate, isPending: false }),
  useUpdatePaymentMethodMutation: () => ({ mutateAsync: mockUpdateMutate, isPending: false }),
}));

const VALID_IBAN_DIGITS = '330006100519786457841326';

describe('PaymentMethodForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits the normalized IBAN payload and calls onSuccess', async () => {
    mockAddMutate.mockResolvedValueOnce(undefined);
    const onSuccess = jest.fn();
    renderWithTamagui(<PaymentMethodForm mode="create" onSuccess={onSuccess} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('TR33 0001 0000 0000 0000 0000 00'),
      VALID_IBAN_DIGITS,
    );
    fireEvent.changeText(screen.getByPlaceholderText('Ad Soyad'), 'Anar Mamedov');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() => expect(mockAddMutate).toHaveBeenCalledTimes(1));
    expect(mockAddMutate).toHaveBeenCalledWith({
      iban: `TR${VALID_IBAN_DIGITS}`,
      ibanName: 'Anar Mamedov',
      isDefault: true,
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('shows a validation error and does not submit an invalid IBAN', async () => {
    renderWithTamagui(<PaymentMethodForm mode="create" onSuccess={jest.fn()} />);

    fireEvent.changeText(screen.getByPlaceholderText('TR33 0001 0000 0000 0000 0000 00'), '12345');
    fireEvent.changeText(screen.getByPlaceholderText('Ad Soyad'), 'Anar Mamedov');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(screen.getByText('Geçerli bir IBAN giriniz (TR + 24 hane).')).toBeTruthy(),
    );
    expect(mockAddMutate).not.toHaveBeenCalled();
  });

  it('requires a full name (first and last)', async () => {
    renderWithTamagui(<PaymentMethodForm mode="create" onSuccess={jest.fn()} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('TR33 0001 0000 0000 0000 0000 00'),
      VALID_IBAN_DIGITS,
    );
    fireEvent.changeText(screen.getByPlaceholderText('Ad Soyad'), 'Anar');
    fireEvent.press(screen.getByText('Kaydet'));

    await waitFor(() =>
      expect(
        screen.getByText('Lütfen ad ve soyadı boşlukla ayırarak giriniz.'),
      ).toBeTruthy(),
    );
    expect(mockAddMutate).not.toHaveBeenCalled();
  });
});
