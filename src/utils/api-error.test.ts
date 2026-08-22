import { getApiErrorMessage, isMissingResourceApiError } from './api-error';

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

describe('getApiErrorMessage', () => {
  function axiosErrorWithData(data: unknown) {
    return { isAxiosError: true, message: 'Request failed', response: { status: 400, data } };
  }

  it('prefers the backend message', () => {
    expect(getApiErrorMessage(axiosErrorWithData({ message: 'Stokta yok' }), 'yedek')).toBe(
      'Stokta yok',
    );
  });

  it('falls back to the backend error field', () => {
    expect(getApiErrorMessage(axiosErrorWithData({ error: 'Paket bulunamadı' }), 'yedek')).toBe(
      'Paket bulunamadı',
    );
  });

  it('ignores blank backend strings', () => {
    expect(getApiErrorMessage(axiosErrorWithData({ message: '   ' }), 'yedek')).toBe('yedek');
  });

  it('never shows the technical error text to the user', () => {
    // "Network Error" gibi metinler İngilizce ve teknik; kullanıcı yedek metni görür.
    expect(getApiErrorMessage(new Error('Network Error'), 'yedek')).toBe('yedek');
    expect(getApiErrorMessage({ isAxiosError: true, code: 'ERR_NETWORK' }, 'yedek')).toBe('yedek');
  });

  it('never returns an empty message', () => {
    expect(getApiErrorMessage(null, 'yedek')).toBe('yedek');
    expect(getApiErrorMessage(undefined, 'yedek')).toBe('yedek');
    expect(getApiErrorMessage(axiosErrorWithData(undefined), 'yedek')).toBe('yedek');
    expect(getApiErrorMessage(axiosErrorWithData({ message: 42 }), 'yedek')).toBe('yedek');
  });
});
