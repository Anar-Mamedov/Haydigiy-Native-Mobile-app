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

const SUCCESS = { success: true, data: { id: '3f2b', reference: 'GB-3F2B8C' } };
const THANKS = 'Geri bildiriminiz alındı. Teşekkür ederiz.';
const SITE_ONLY = 'Yalnızca haydigiy.com adresleri kabul edilir.';
const PRODUCT_REF = 'Ürün adı veya kodu (biliyorsanız)';

/** Yalnız ürün sorusu + zorunlu mesaj ve yalnız sayfa alanı + zorunlu mesaj olan küçük form. */
const SMALL_FORM = {
  version: 5,
  title: 'Konu?',
  viewer: null,
  categories: [
    {
      key: 'product_issues',
      title: 'Ürünle İlgili Sorunlar',
      description: 'Ürün bilgisi, fiyat, görsel ve kategori',
      message: { mode: 'required', label: 'Sorunun açıklaması', placeholder: '' },
      fields: [{ key: 'product_ref', type: 'text', label: PRODUCT_REF, required: false, config: { max_length: 120, autofill: 'product' } }],
    },
    {
      key: 'site_issues',
      title: 'Site ve Sayfa Sorunları',
      description: 'Bozuk sayfa',
      message: { mode: 'required', label: 'Sorunun açıklaması', placeholder: '' },
      fields: [{ key: 'page', type: 'url', label: 'Sorunun yaşandığı sayfa', required: false, config: { placeholder: 'https://', autofill: 'page_url' } }],
    },
  ],
};

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

  it('submits the documented body with an Idempotency-Key and thanks without a tracking number', async () => {
    const onSubmitted = jest.fn();
    renderWithTamagui(<CustomerFeedbackForm onSubmitted={onSubmitted} productId={77} />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Kargo ile ilgili bir önerim var.');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText(THANKS)).toBeTruthy();
    expect(screen.queryByText('GB-3F2B8C')).toBeNull();
    expect(screen.queryByText(/kopyala/i)).toBeNull();
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
    expect(onSubmitted).toHaveBeenCalledWith({ duplicate: false });
  });

  it('shows the same thanks for a duplicate and once the server stops sending the reference', async () => {
    service.submitCustomerFeedbackDto.mockResolvedValue({ success: true, data: { id: '3f2b' }, duplicate: true });
    const onSubmitted = jest.fn();
    renderWithTamagui(<CustomerFeedbackForm onSubmitted={onSubmitted} />);
    await openOtherCategory();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'İkinci kez');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText(THANKS)).toBeTruthy();
    expect(onSubmitted).toHaveBeenCalledWith({ duplicate: true });
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
    expect(await screen.findByText(THANKS)).toBeTruthy();
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
    const texts = { submit: 'Yolla', sending: 'Yollanıyor…', success: '✅ Ulaştı', error: 'Gönderilemedi.', cancel: 'Vazgeç' };
    const onCancel = jest.fn();
    const { unmount } = renderWithTamagui(<CustomerFeedbackForm allowAnother={false} fixedCategoryKey="general_other" onCancel={onCancel} texts={texts} />);

    expect(await screen.findByLabelText('Açıklama *')).toBeTruthy();
    expect(screen.queryByText('Geri bildiriminiz hangi konuyla ilgili?')).toBeNull();
    fireEvent.press(screen.getByText('Vazgeç'));
    expect(onCancel).toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Açıklama *'), 'Teşekkürler');
    fireEvent.press(screen.getByText('Yolla'));
    expect(await screen.findByText('✅ Ulaştı')).toBeTruthy();
    expect(screen.queryByText('GB-3F2B8C')).toBeNull();
    expect(screen.queryByText('Başka bir konu bildir')).toBeNull();
    unmount();

    service.getFeedbackFormDto.mockClear();
    renderWithTamagui(<CustomerFeedbackForm fixedCategoryKey="removed_key" texts={texts} />);
    expect(await screen.findByText('Gönderilemedi.')).toBeTruthy();
    await waitFor(() => expect(service.getFeedbackFormDto).toHaveBeenCalledTimes(2));
    await act(async () => undefined);
  });

  it('product screen: opens on "Ürünle İlgili Sorunlar" without the product question and sends product_id', async () => {
    service.getFeedbackFormDto.mockResolvedValue(SMALL_FORM);
    renderWithTamagui(<CustomerFeedbackForm initialCategoryKey="product_issues" productId={77} />);

    expect(await screen.findByText('Ürünle İlgili Sorunlar')).toBeTruthy();
    expect(screen.queryByText('Konu?')).toBeNull();
    expect(screen.queryByLabelText(PRODUCT_REF)).toBeNull();

    fireEvent.changeText(screen.getByLabelText('Sorunun açıklaması *'), 'Fiyat yanlış görünüyor.');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText(THANKS)).toBeTruthy();
    expect(service.submitCustomerFeedbackDto.mock.calls[0][0]).toMatchObject({
      context: 'general',
      category_key: 'product_issues',
      answers: [],
      product_id: 77,
    });
  });

  it('product screen: "Başka bir konu bildir" goes back to the category list', async () => {
    service.getFeedbackFormDto.mockResolvedValue(SMALL_FORM);
    renderWithTamagui(<CustomerFeedbackForm initialCategoryKey="product_issues" productId={77} />);

    fireEvent.changeText(await screen.findByLabelText('Sorunun açıklaması *'), 'Taslak');
    fireEvent.press(screen.getByTestId('feedback-other-topic'));

    expect(screen.getByText('Konu?')).toBeTruthy();
    expect(screen.queryByTestId('feedback-submit')).toBeNull();
    // Listeden yeniden seçilen başlık kısayola dönmez, liste açık kalır.
    fireEvent.press(screen.getByLabelText('Ürünle İlgili Sorunlar, Ürün bilgisi, fiyat, görsel ve kategori'));
    expect(screen.getByText('Konu?')).toBeTruthy();
    expect(screen.getByLabelText('Sorunun açıklaması *').props.value).toBe('');
  });

  it('asks the product question when "Ürünle İlgili Sorunlar" is opened outside the product screen', async () => {
    service.getFeedbackFormDto.mockResolvedValue(SMALL_FORM);
    renderWithTamagui(<CustomerFeedbackForm />);

    fireEvent.press(await screen.findByLabelText('Ürünle İlgili Sorunlar, Ürün bilgisi, fiyat, görsel ve kategori'));
    expect(screen.getByLabelText(PRODUCT_REF)).toBeTruthy();
  });

  it('shows the category list when the preselected category is not in the form', async () => {
    renderWithTamagui(<CustomerFeedbackForm initialCategoryKey="removed_key" productId={77} />);

    expect(await screen.findByText('Geri bildiriminiz hangi konuyla ilgili?')).toBeTruthy();
    expect(screen.queryByTestId('feedback-other-topic')).toBeNull();
  });

  it('leaves the page field empty and accepts only site addresses there', async () => {
    service.getFeedbackFormDto.mockResolvedValue(SMALL_FORM);
    renderWithTamagui(<CustomerFeedbackForm />);
    fireEvent.press(await screen.findByLabelText('Site ve Sayfa Sorunları, Bozuk sayfa'));

    const page = screen.getByLabelText('Sorunun yaşandığı sayfa');
    expect(page.props.value).toBe('');
    fireEvent.changeText(screen.getByLabelText('Sorunun açıklaması *'), 'Sayfa açılmıyor');
    fireEvent.changeText(page, 'https://evil.example.com/');
    fireEvent(page, 'blur');

    expect(await screen.findByText(SITE_ONLY)).toBeTruthy();
    expect(screen.getByTestId('feedback-submit').props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.changeText(screen.getByLabelText('Sorunun yaşandığı sayfa'), 'https://www.haydigiy.com/urun/x?a=1');
    await waitFor(() => expect(screen.queryByText(SITE_ONLY)).toBeNull());
    expect(screen.getByTestId('feedback-submit').props.accessibilityState).toMatchObject({ disabled: false });
  });

  it('shows a server 422 for the page field under that field', async () => {
    service.getFeedbackFormDto.mockResolvedValue(SMALL_FORM);
    service.submitCustomerFeedbackDto.mockRejectedValueOnce(
      http(422, { success: false, code: 'validation_failed', errors: { 'answers.page': 'Geçersiz değer.' } }),
    );
    renderWithTamagui(<CustomerFeedbackForm />);
    fireEvent.press(await screen.findByLabelText('Site ve Sayfa Sorunları, Bozuk sayfa'));

    fireEvent.changeText(screen.getByLabelText('Sorunun açıklaması *'), 'Sayfa açılmıyor');
    fireEvent.changeText(screen.getByLabelText('Sorunun yaşandığı sayfa'), 'https://haydigiytr.com/sepet');
    fireEvent.press(screen.getByTestId('feedback-submit'));

    expect(await screen.findByText('Geçersiz değer.')).toBeTruthy();
    expect(service.submitCustomerFeedbackDto.mock.calls[0][0].answers).toEqual([
      { field_key: 'page', instance_index: 0, value: 'https://haydigiytr.com/sepet' },
    ]);
  });
});
