import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { FastLoginForm } from './fast-login-form';

const mockFastLoginInit = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: () => undefined,
}));

jest.mock('../api/auth.mutations', () => ({
  useFastLoginInitMutation: () => ({ mutateAsync: mockFastLoginInit }),
}));

const LOCK_MESSAGE =
  'Çok fazla hatalı doğrulama kodu girdiniz. Lütfen 3 dakika 55 saniye sonra tekrar deneyin.';

function renderForm() {
  const onSuccess = jest.fn();
  renderWithTamagui(<FastLoginForm onBackToLogin={jest.fn()} onSuccess={onSuccess} />);
  return { onSuccess };
}

describe('FastLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('moves on to the code step with the backend countdown', async () => {
    mockFastLoginInit.mockResolvedValueOnce({ is_new_user: false, remaining_seconds: 60 });
    const { onSuccess } = renderForm();

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Devam Et'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('5321234567', false, 'phone', 60));
  });

  it('requests the code from the keyboard submit key like the Devam Et button', async () => {
    mockFastLoginInit.mockResolvedValueOnce({ is_new_user: true, remaining_seconds: 90 });
    const { onSuccess } = renderForm();

    const input = screen.getByLabelText('Telefon Numarası');
    fireEvent.changeText(input, '0532 123 45 67');
    fireEvent(input, 'submitEditing');

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('5321234567', true, 'phone', 90));
    expect(input.props.returnKeyType).toBe('done');
  });

  it('does not resend from the keyboard while the number is locked', async () => {
    mockFastLoginInit.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: { message: LOCK_MESSAGE, remaining_attempts: 0, remaining_seconds: 235 },
        status: 429,
      },
    });
    renderForm();

    const input = screen.getByLabelText('Telefon Numarası');
    fireEvent.changeText(input, '0532 123 45 67');
    fireEvent(input, 'submitEditing');
    expect(await screen.findByText(LOCK_MESSAGE)).toBeTruthy();

    fireEvent(input, 'submitEditing');
    expect(mockFastLoginInit).toHaveBeenCalledTimes(1);
  });

  it('shows a 429 lock message as-is and blocks that number until the window ends', async () => {
    mockFastLoginInit.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: { message: LOCK_MESSAGE, remaining_attempts: 0, remaining_seconds: 235 },
        status: 429,
      },
    });
    const { onSuccess } = renderForm();

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Devam Et'));

    expect(await screen.findByText(LOCK_MESSAGE)).toBeTruthy();
    expect(screen.getByText('Kalan Süre: 03:55')).toBeTruthy();
    fireEvent.press(screen.getByText('Kalan Süre: 03:55'));
    expect(mockFastLoginInit).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('lets another number be sent while the locked one waits', async () => {
    mockFastLoginInit.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: LOCK_MESSAGE, remaining_seconds: 235 }, status: 429 },
    });
    renderForm();

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
    fireEvent.press(screen.getByText('Devam Et'));
    expect(await screen.findByText('Kalan Süre: 03:55')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0533 765 43 21');

    expect(screen.getByText('Devam Et')).toBeTruthy();
  });
});
