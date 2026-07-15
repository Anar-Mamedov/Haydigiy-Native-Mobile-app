import { parseProfileUpdateError } from './profile-update-error';

describe('parseProfileUpdateError', () => {
  it('extracts the phone validation message', () => {
    const message = 'Bu telefon numarası başka bir kullanıcı tarafından kullanılıyor.';

    expect(
      parseProfileUpdateError({
        response: { data: { errors: { phone: [message] }, message } },
      }),
    ).toEqual({ message, phoneMessage: message });
  });

  it('uses the general API message when there is no phone validation error', () => {
    expect(
      parseProfileUpdateError({ response: { data: { message: 'Profil güncellenemedi.' } } }),
    ).toEqual({ message: 'Profil güncellenemedi.', phoneMessage: null });
  });

  it('returns a safe fallback for an unknown error shape', () => {
    expect(parseProfileUpdateError(new Error('Network Error'))).toEqual({
      message: 'Bilgiler güncellenirken bir hata oluştu.',
      phoneMessage: null,
    });
  });
});
