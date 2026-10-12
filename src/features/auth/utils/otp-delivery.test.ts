import { getOtpRateLimit, getOtpSendErrorFeedback, parseOtpCooldownSeconds } from './otp-delivery';

describe('OTP delivery helpers', () => {
  it('normalizes numeric and decimal-string cooldown values', () => {
    expect(parseOtpCooldownSeconds(42)).toBe(42);
    expect(parseOtpCooldownSeconds('12.4')).toBe(13);
    expect(parseOtpCooldownSeconds('8,2')).toBe(9);
  });

  it('returns zero for missing or invalid cooldown values', () => {
    expect(parseOtpCooldownSeconds(undefined)).toBe(0);
    expect(parseOtpCooldownSeconds('invalid')).toBe(0);
    expect(parseOtpCooldownSeconds(-1)).toBe(0);
    expect(parseOtpCooldownSeconds(undefined, 60)).toBe(60);
  });

  it('preserves the backend message and cooldown from a throttled send request', () => {
    expect(
      getOtpSendErrorFeedback({
        response: {
          data: {
            message: 'Tekrar göndermek için 30 saniye bekleyin.',
            remaining_seconds: '29.2',
          },
        },
      }),
    ).toEqual({
      cooldownSeconds: 30,
      message: 'Tekrar göndermek için 30 saniye bekleyin.',
    });
  });

  it('never shows the technical axios text when the body has no message', () => {
    expect(
      getOtpSendErrorFeedback({
        message: 'Request failed with status code 429',
        response: { data: { remaining_seconds: 30 } },
      }).message,
    ).toBe('Kodu tekrar göndermek için lütfen bekleyin.');
  });
});

describe('getOtpRateLimit', () => {
  const lockMessage =
    'Çok fazla hatalı doğrulama kodu girdiniz. Lütfen 3 dakika 55 saniye sonra tekrar deneyin.';

  function axiosError(status: number, data: Record<string, unknown>) {
    return { isAxiosError: true, message: `Request failed with status code ${status}`, response: { data, status } };
  }

  it('returns the backend wait and its message untouched for a 429', () => {
    expect(
      getOtpRateLimit(axiosError(429, { message: lockMessage, remaining_attempts: 0, remaining_seconds: 235 })),
    ).toEqual({ cooldownSeconds: 235, message: lockMessage });
  });

  it('accepts a string wait and falls back to Turkish copy without a message', () => {
    expect(getOtpRateLimit(axiosError(429, { remaining_seconds: '59.4' }))).toEqual({
      cooldownSeconds: 60,
      message: 'Çok fazla deneme yaptınız. Lütfen bir süre sonra tekrar deneyin.',
    });
  });

  it('ignores other statuses, a 429 without a wait and non-axios errors', () => {
    expect(getOtpRateLimit(axiosError(422, { message: 'Kod geçersiz.', remaining_seconds: 30 }))).toBeNull();
    expect(getOtpRateLimit(axiosError(429, { message: 'Günlük limit doldu.' }))).toBeNull();
    expect(getOtpRateLimit(new Error('Network Error'))).toBeNull();
  });
});
