import { toFeedbackApiError } from './feedback-api-error';

const http = (status: number, data: unknown, headers: Record<string, string> = {}) => ({ response: { status, data, headers } });

describe('toFeedbackApiError (sözleşme v1.0 §5)', () => {
  it.each([
    [http(422, { code: 'validation_failed', errors: { message: 'Mesaj zorunlu.' } }), 'validation'],
    [http(422, { code: 'attachment_invalid' }), 'attachment'],
    [http(422, { code: 'form_outdated' }), 'form_outdated'],
    [http(422, { code: 'file_type_not_allowed' }), 'file_rejected'],
    [http(413, { code: 'file_too_large' }), 'file_rejected'],
    [http(413, { code: 'payload_too_large' }), 'too_large'],
    [http(409, { code: 'request_in_progress' }), 'in_progress'],
    [http(429, { code: 'too_many_requests' }), 'too_many'],
    [http(503, { code: 'disabled' }), 'disabled'],
    [http(503, { code: 'unavailable' }), 'unavailable'],
    [http(422, { code: 'invalid_idempotency_key' }), 'client'],
    [new Error('Network Error'), 'network'],
  ])('classifies %#', (error, kind) => {
    expect(toFeedbackApiError(error).kind).toBe(kind);
  });

  it('keeps server field messages as plain strings and reads Retry-After', () => {
    const error = toFeedbackApiError(http(422, { code: 'validation_failed', errors: { 'answers.device': 'Bu alan zorunlu.', bad: 5 } }));
    expect(error.errors).toEqual({ 'answers.device': 'Bu alan zorunlu.' });
    expect(toFeedbackApiError(http(429, {}, { 'retry-after': '1800' })).retryAfterSeconds).toBe(1800);
    expect(toFeedbackApiError(http(429, {})).retryAfterSeconds).toBe(60);
  });
});
