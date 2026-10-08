import { apiClient } from '@/lib/axios';
import { sendFeedbackDto } from './feedback.service';

jest.mock('@/lib/axios', () => ({
  apiClient: { post: jest.fn() },
}));

describe('sendFeedbackDto', () => {
  it('posts the message to /feedback like the web', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });

    await sendFeedbackDto({ message: 'Uygulama çok hızlı.' });

    expect(apiClient.post).toHaveBeenCalledWith('/feedback', { message: 'Uygulama çok hızlı.' });
  });
});
