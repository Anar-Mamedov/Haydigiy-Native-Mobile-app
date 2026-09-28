import {
  getRemainingCodeAttempts,
  isPhoneChangeCodeSent,
  isPhoneChangeStillPending,
  isProfileUpdateSaved,
} from './profile-update-result';

describe('isPhoneChangeCodeSent', () => {
  it('is true when the backend sent a code to the new number', () => {
    expect(
      isPhoneChangeCodeSent({ code_sent: true, success: true, verification_required: true }),
    ).toBe(true);
  });

  it('is false for a saved profile', () => {
    expect(isPhoneChangeCodeSent({ message: 'Profil başarıyla güncellendi.' })).toBe(false);
    expect(isPhoneChangeCodeSent(undefined)).toBe(false);
  });
});

describe('isProfileUpdateSaved', () => {
  it('treats a v1 response without verification fields as saved', () => {
    expect(isProfileUpdateSaved({ message: 'Profil başarıyla güncellendi.' })).toBe(true);
    expect(isProfileUpdateSaved(undefined)).toBe(true);
  });

  it('treats the verified v2 response as saved', () => {
    expect(isProfileUpdateSaved({ success: true })).toBe(true);
  });

  it('never treats a pending code as saved', () => {
    // Regression guard: the first v2 call saves nothing, not even the other fields.
    expect(
      isProfileUpdateSaved({ code_sent: true, success: true, verification_required: true }),
    ).toBe(false);
  });

  it('treats an explicit failure as not saved', () => {
    expect(isProfileUpdateSaved({ message: 'Hata', success: false })).toBe(false);
  });
});

describe('getRemainingCodeAttempts', () => {
  it('reads the attempts left from a rejected code', () => {
    const error = { response: { data: { message: 'Doğrulama kodu hatalı.', remaining_attempts: 3 } } };
    expect(getRemainingCodeAttempts(error)).toBe(3);
  });

  it('returns null when the backend did not report attempts', () => {
    expect(getRemainingCodeAttempts({ response: { data: { message: 'Hata' } } })).toBeNull();
    expect(getRemainingCodeAttempts(new Error('Network Error'))).toBeNull();
  });
});

describe('isPhoneChangeStillPending', () => {
  it('recognises the resend-window rejection that keeps the sent code valid', () => {
    const error = {
      response: { data: { remaining_seconds: 42, success: false, verification_required: true } },
    };
    expect(isPhoneChangeStillPending(error)).toBe(true);
  });

  it('ignores ordinary validation errors', () => {
    const error = {
      response: { data: { message: 'Bu telefon numarası başka bir kullanıcı tarafından kullanılıyor.' } },
    };
    expect(isPhoneChangeStillPending(error)).toBe(false);
  });
});
