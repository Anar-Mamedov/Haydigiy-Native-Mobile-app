import { isMissingResourceApiError } from './api-error';

function axiosErrorWithStatus(status: number) {
  return {
    isAxiosError: true,
    response: { status },
  };
}

describe('isMissingResourceApiError', () => {
  it.each([404, 410])('recognizes HTTP %s as a missing resource', (status) => {
    expect(isMissingResourceApiError(axiosErrorWithStatus(status))).toBe(true);
  });

  it.each([400, 401, 422, 500, 503])('does not classify HTTP %s as not found', (status) => {
    expect(isMissingResourceApiError(axiosErrorWithStatus(status))).toBe(false);
  });

  it('does not classify network or ordinary errors as not found', () => {
    expect(isMissingResourceApiError({ isAxiosError: true, code: 'ERR_NETWORK' })).toBe(false);
    expect(isMissingResourceApiError(new Error('Network request failed'))).toBe(false);
  });
});
