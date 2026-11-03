import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import fixture from '../__fixtures__/forms-general.json';
import { CustomerFeedbackForm } from './customer-feedback-form';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  VideoExportPreset: { H264_1280x720: 6 },
}));
jest.mock('@/lib/prepare-upload-photo', () => ({ prepareUploadPhoto: jest.fn() }));
jest.mock('@/services/customer-feedback.service', () => ({
  IMAGE_UPLOAD_TIMEOUT_MS: 60_000,
  VIDEO_UPLOAD_TIMEOUT_MS: 180_000,
  getFeedbackFormDto: jest.fn(),
  uploadFeedbackAttachmentDto: jest.fn(),
  submitCustomerFeedbackDto: jest.fn(),
}));

const service = jest.requireMock('@/services/customer-feedback.service') as {
  getFeedbackFormDto: jest.Mock;
  submitCustomerFeedbackDto: jest.Mock;
};

const http = (status: number, data: unknown, headers: Record<string, string> = {}) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status, data, headers } });

const SUCCESS = { data: { id: '3f2b', reference: 'GB-3F2B8C' } };

async function openOtherCategory() {
  fireEvent.press(await screen.findByLabelText('Diğer, Yukarıdaki kategoriler dışında kalan konular'));
}

beforeEach(() => {
  jest.clearAllMocks();
  service.getFeedbackFormDto.mockResolvedValue(fixture.data);
  service.submitCustomerFeedbackDto.mockResolvedValue(SUCCESS);
});

describe('CustomerFeedbackForm', () => {
  it('draws the categories from the server and keeps submit disabled until required fields are filled', async () => {
    renderWithTamagui(<CustomerFeedbackForm />);

    expect(await screen.findByText('Geri bildiriminiz hangi konuyla ilgili?')).toBeTruthy();
    expect(screen.getByText('Ürünle İlgili Sorunlar')).toBeTruthy();
    expect(screen.queryByTestId('feedback-submit')).toBeNull();

    await openOtherCategory();
    expect(screen.getByTestId('feedback-submit').props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByText('Göndermek için zorunlu (*) alanları doldurun.')).toBeTruthy();
    // Misafir: iletişim alanları isteğe bağlı.
    expect(screen.getByLabelText('E-posta (isteğe bağlı)')).toBeTruthy();
  });

  it('submits the documented body with an Idempotency-Key and shows the reference code', async () => {
    const onSubmitted = jest.fn();
    renderWithTamagui(<CustomerFeedbackForm onSubmitted={onSubmitted} productId={77} />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Kargo ile ilgili bir önerim var.');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('GB-3F2B8C')).toBeTruthy();
    const [payload, key] = service.submitCustomerFeedbackDto.mock.calls[0];
    expect(payload).toEqual({
      context: 'general',
      category_key: 'general_other',
      message: 'Kargo ile ilgili bir önerim var.',
      answers: [],
      attachment_tokens: [],
      platform: 'ios',
      product_id: 77,
      website: '',
    });
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
    expect(onSubmitted).toHaveBeenCalledWith({ reference: 'GB-3F2B8C', duplicate: false });
  });

  it('shows server field errors under the field and keeps what the customer wrote', async () => {
    service.submitCustomerFeedbackDto.mockRejectedValueOnce(
      http(422, { code: 'validation_failed', errors: { message: 'Mesajda kod ya da HTML kullanılamaz.' } }),
    );
    renderWithTamagui(<CustomerFeedbackForm />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'javascript:alert(1)');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('Mesajda kod ya da HTML kullanılamaz.')).toBeTruthy();
    expect(screen.getByLabelText('Açıklama *').props.value).toBe('javascript:alert(1)');
  });

  it('never says "received" on a network error and retries with the SAME key', async () => {
    service.submitCustomerFeedbackDto.mockRejectedValueOnce(new Error('Network Error'));
    renderWithTamagui(<CustomerFeedbackForm />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Uygulama donuyor.');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('Şu an gönderemedik. Bilgileriniz saklandı, tekrar deneyin.')).toBeTruthy();
    expect(screen.queryByTestId('feedback-success')).toBeNull();
    expect(screen.getByLabelText('Açıklama *').props.value).toBe('Uygulama donuyor.');

    fireEvent.press(screen.getByTestId('feedback-submit'));
    expect(await screen.findByText('GB-3F2B8C')).toBeTruthy();
    const keys = service.submitCustomerFeedbackDto.mock.calls.map((call) => call[1]);
    expect(keys[0]).toBe(keys[1]);
  });

  it('locks the button for Retry-After on 429', async () => {
    service.submitCustomerFeedbackDto.mockRejectedValueOnce(http(429, { code: 'too_many_requests' }, { 'retry-after': '30' }));
    renderWithTamagui(<CustomerFeedbackForm />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Deneme');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('Çok sık deneme yaptınız, biraz sonra tekrar deneyin.')).toBeTruthy();
    expect(screen.getByTestId('feedback-submit').props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByText('Gönder (30)')).toBeTruthy();
  });

  it('refetches the form on form_outdated and tells the customer', async () => {
    service.submitCustomerFeedbackDto.mockRejectedValueOnce(http(422, { code: 'form_outdated' }));
    renderWithTamagui(<CustomerFeedbackForm />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Deneme');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('Form güncellendi, lütfen kontrol edin.')).toBeTruthy();
    expect(service.getFeedbackFormDto.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Açıklama *').props.value).toBe('Deneme');
  });

  it('tells members their contact info comes from the account', async () => {
    service.getFeedbackFormDto.mockResolvedValue({ ...fixture.data, viewer: { full_name: 'Ayşe Y.', phone: '05321234567', email: 'a@b.co' } });
    renderWithTamagui(<CustomerFeedbackForm />);
    await openOtherCategory();

    expect(screen.getByText('Geri dönüş bilgileriniz üyeliğinizden alınacak.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Değiştir'));
    expect(screen.getByLabelText('Ad Soyad (isteğe bağlı)').props.value).toBe('Ayşe Y.');
  });

  it('hides the form when the feature is disabled on the server', async () => {
    service.getFeedbackFormDto.mockRejectedValue(http(503, { code: 'disabled' }));
    renderWithTamagui(<CustomerFeedbackForm />);

    expect(await screen.findByText('Geri bildirim şu an alınmıyor.')).toBeTruthy();
  });

  it('fixed category (assistant): skips the list, uses block texts, and reloads when the category is gone', async () => {
    const texts = { submit: 'Yolla', sending: 'Yollanıyor…', success: '✅ Ulaştı', reference: 'Takip kodunuz:', error: 'Gönderilemedi.', cancel: 'Vazgeç' };
    const onCancel = jest.fn();
    const { unmount } = renderWithTamagui(<CustomerFeedbackForm allowAnother={false} fixedCategoryKey="general_other" onCancel={onCancel} texts={texts} />);

    expect(await screen.findByLabelText('Açıklama *')).toBeTruthy();
    expect(screen.queryByText('Geri bildiriminiz hangi konuyla ilgili?')).toBeNull();
    fireEvent.press(screen.getByText('Vazgeç'));
    expect(onCancel).toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Teşekkürler');
    fireEvent.press(screen.getByText('Yolla'));
    expect(await screen.findByText('✅ Ulaştı')).toBeTruthy();
    expect(screen.getByText('Takip kodunuz:')).toBeTruthy();
    expect(screen.queryByText('Başka bir konu bildir')).toBeNull();
    unmount();

    service.getFeedbackFormDto.mockClear();
    renderWithTamagui(<CustomerFeedbackForm fixedCategoryKey="removed_key" texts={texts} />);
    expect(await screen.findByText('Gönderilemedi.')).toBeTruthy();
    await waitFor(() => expect(service.getFeedbackFormDto).toHaveBeenCalledTimes(2));
    await act(async () => undefined);
  });
});
