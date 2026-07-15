import { getOtpSendErrorFeedback, parseOtpCooldownSeconds } from './otp-delivery';

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
});
