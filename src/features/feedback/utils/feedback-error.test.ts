import { AxiosError, AxiosHeaders } from 'axios';
import { getFeedbackErrorMessage } from './feedback-error';

function axiosError(status: number, data: unknown) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data,
    headers: {},
    status,
    statusText: '',
  });
}

const FALLBACK = 'Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';

describe('getFeedbackErrorMessage', () => {
  it('shows backend validation messages', () => {
    expect(getFeedbackErrorMessage(axiosError(422, { message: 'Mesaj çok uzun.' }))).toBe('Mesaj çok uzun.');
  });

  it('hides technical route and server errors behind the web fallback', () => {
    expect(
      getFeedbackErrorMessage(axiosError(404, { message: 'The route api/feedback could not be found.' })),
    ).toBe(FALLBACK);
    expect(getFeedbackErrorMessage(axiosError(500, { message: 'Server Error' }))).toBe(FALLBACK);
    expect(getFeedbackErrorMessage(new Error('Network Error'))).toBe(FALLBACK);
  });
});
