import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { RegisterForm } from './register-form';

const mockRegister = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

jest.mock('../api/auth.mutations', () => ({
  useRegisterMutation: () => ({ mutateAsync: mockRegister }),
}));

function renderForm() {
  const onSuccess = jest.fn();
  renderWithTamagui(<RegisterForm onSuccess={onSuccess} />);
  return { onSuccess };
}

function fillRequiredFields() {
  fireEvent.changeText(screen.getByLabelText('Ad'), 'Ayşe');
  fireEvent.changeText(screen.getByLabelText('Soyad'), 'Yılmaz');
  fireEvent.changeText(screen.getByLabelText('Telefon Numarası'), '0532 123 45 67');
  fireEvent.changeText(screen.getByLabelText('Şifre'), 'gizli123');
}

const checkbox = (label: string) => screen.getByRole('checkbox', { name: label });

describe('RegisterForm consents (HF-62)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('starts with all three consent boxes unchecked', () => {
    renderForm();

    ['Açık rıza onayı', 'Ticari elektronik ileti onayı', 'Aydınlatma Metni onayı'].forEach((label) => {
      expect(checkbox(label).props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
    });
  });

  it('blocks sign-up until the Aydınlatma Metni box is checked', async () => {
    renderForm();
    fillRequiredFields();

    fireEvent.press(screen.getByText('Ücretsiz Üye Ol'));

    expect(await screen.findByText('Devam etmek için Aydınlatma Metni’ni okuduğunuzu onaylayın.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('sends the explicit consent with the other consents', async () => {
    mockRegister.mockResolvedValueOnce({ message: 'ok' });
    const { onSuccess } = renderForm();
    fillRequiredFields();

    fireEvent.press(checkbox('Açık rıza onayı'));
    fireEvent.press(checkbox('Aydınlatma Metni onayı'));
    fireEvent.press(screen.getByText('Ücretsiz Üye Ol'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('5321234567'));
    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({ kvkk_consent: true, communication_consent: false, explicit_consent: true }),
    );
  });

  it.each([
    ['açık rıza', '/bilgi/acik-riza-metni'],
    ['Tarafıma elektronik ileti gönderilmesini kabul ediyorum.', '/bilgi/ticari-elektronik-ileti'],
    ['Aydınlatma Metni', '/bilgi/kisisel-verilerin-korunmasi'],
    ['Kullanım Koşulları', '/bilgi/kullanim-kosullari'],
    ['Gizlilik Politikası', '/bilgi/gizlilik-politikasi'],
  ])('opens “%s” on its info page without toggling a box', (linkText, route) => {
    renderForm();

    fireEvent.press(screen.getByRole('link', { name: linkText }));

    expect(mockPush).toHaveBeenCalledWith(route);
    expect(checkbox('Ticari elektronik ileti onayı').props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });
});
