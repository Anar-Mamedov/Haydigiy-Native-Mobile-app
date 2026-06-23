import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { HelpFeedbackButton } from './help-feedback-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockMutateAsync = jest.fn();

jest.mock('../api/help.mutations', () => ({
  useHelpFeedbackMutation: () => ({ mutateAsync: mockMutateAsync }),
}));

describe('HelpFeedbackButton', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends feedback for the article and shows a thank-you on success', async () => {
    mockMutateAsync.mockResolvedValueOnce(undefined);
    renderWithTamagui(<HelpFeedbackButton articleId={42} />);

    expect(screen.getByText('Faydalı')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Bu içerik faydalı'));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(42));
    await waitFor(() => expect(screen.getByText('Teşekkürler')).toBeTruthy());
  });

  it('shows an error message when the feedback request fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('network'));
    renderWithTamagui(<HelpFeedbackButton articleId={7} />);

    fireEvent.press(screen.getByLabelText('Bu içerik faydalı'));

    await waitFor(() =>
      expect(screen.getByText('Gönderilemedi. Lütfen tekrar deneyin.')).toBeTruthy(),
    );
  });
});
