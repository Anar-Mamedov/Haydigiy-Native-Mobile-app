import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import fixture from '@/features/customer-feedback/__fixtures__/forms-general.json';
import { DEFAULT_FEEDBACK_FORM_TEXTS } from '../api/assistant-blocks.mapper';
import { AssistantFeedbackFormBlock } from './blocks/assistant-feedback-form-block';

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
jest.mock('../services/assistant-events', () => ({ trackAssistantEvent: jest.fn() }));

const service = jest.requireMock('@/services/customer-feedback.service') as {
  getFeedbackFormDto: jest.Mock;
  submitCustomerFeedbackDto: jest.Mock;
};
const { trackAssistantEvent } = jest.requireMock('../services/assistant-events') as { trackAssistantEvent: jest.Mock };

const block = {
  type: 'feedback_form' as const,
  id: 'b8',
  context: 'general' as const,
  category: 'general_other',
  title: 'Diğer',
  texts: DEFAULT_FEEDBACK_FORM_TEXTS,
};

beforeEach(() => {
  jest.clearAllMocks();
  service.getFeedbackFormDto.mockResolvedValue(fixture.data);
  service.submitCustomerFeedbackDto.mockResolvedValue({ data: { id: '1', reference: 'GB-ABC123' } });
});

describe('AssistantFeedbackFormBlock', () => {
  it.each(['light', 'dark'] as const)('submits through the shared form and reports only an empty feedback_submitted event (%s)', async (theme) => {
    renderWithTamagui(<AssistantFeedbackFormBlock block={block} />, theme);

    fireEvent.changeText(await screen.findByLabelText('Açıklama *'), 'Teşekkürler!');
    fireEvent.press(screen.getByText('Gönder'));

    expect(await screen.findByText('✅ Geri bildiriminiz bize ulaştı, teşekkür ederiz.')).toBeTruthy();
    expect(screen.getByText('Takip kodunuz:')).toBeTruthy();
    expect(screen.getByText('GB-ABC123')).toBeTruthy();
    expect(service.submitCustomerFeedbackDto.mock.calls[0][0]).toMatchObject({ context: 'general', category_key: 'general_other', website: '' });
    expect(trackAssistantEvent).toHaveBeenCalledWith('feedback_submitted', { blockId: 'b8' });
    expect(screen.queryByText('Gönder')).toBeNull();
  });

  it('closes the card on "Vazgeç"', async () => {
    renderWithTamagui(<AssistantFeedbackFormBlock block={block} />);

    fireEvent.press(await screen.findByText('Vazgeç'));
    expect(screen.queryByTestId('assistant-feedback-form')).toBeNull();
    expect(trackAssistantEvent).not.toHaveBeenCalled();
  });

  it('shows texts.error with a retry button when the form cannot be loaded', async () => {
    service.getFeedbackFormDto.mockRejectedValue(Object.assign(new Error('x'), { response: { status: 503, data: { code: 'forms_unavailable' } } }));
    renderWithTamagui(<AssistantFeedbackFormBlock block={block} />);

    expect(await screen.findByText('Gönderilemedi, lütfen tekrar deneyin.', {}, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByText('Tekrar dene')).toBeTruthy();
  });
});
