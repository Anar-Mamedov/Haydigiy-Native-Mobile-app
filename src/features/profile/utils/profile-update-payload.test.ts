import type { UserInfoFormData } from '../schemas/user-info.schema';
import { buildProfileUpdatePayload, isProfilePhoneLocked } from './profile-update-payload';

const formData: UserInfoFormData = {
  name: ' Anar ',
  surname: ' Mamedov ',
  email: ' anar@example.com ',
  phone: '',
  gender: 'male',
  day: '8',
  month: '5',
  year: '1990',
};

describe('isProfilePhoneLocked', () => {
  it('locks a number that is already on the account', () => {
    expect(isProfilePhoneLocked({ phone: '5551234567' })).toBe(true);
  });

  it('leaves an account without a number free to add one', () => {
    expect(isProfilePhoneLocked({ phone: null })).toBe(false);
    expect(isProfilePhoneLocked({ phone: '' })).toBe(false);
    expect(isProfilePhoneLocked({ phone: '   ' })).toBe(false);
  });
});

describe('buildProfileUpdatePayload', () => {
  it('trims the text fields and combines the birth date', () => {
    expect(buildProfileUpdatePayload(formData, { phone: null })).toEqual({
      name: 'Anar',
      surname: 'Mamedov',
      email: 'anar@example.com',
      phone: null,
      birth_date: '1990-05-08',
      gender: 'male',
    });
  });

  it('never replaces or reformats a saved phone number', () => {
    // Regression: the saved number used to follow the editable field, so it
    // could be changed without any verification code.
    const payload = buildProfileUpdatePayload(
      { ...formData, phone: '5321234567' },
      { phone: '05551234567' },
    );

    expect(payload.phone).toBe('05551234567');
  });

  it('sends the digits of a number added to an account without one', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, phone: '532 123 45 67' },
      { phone: null },
    );

    expect(payload.phone).toBe('5321234567');
  });

  it('sends null for the optional fields left empty', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, day: '', gender: '' },
      { phone: null },
    );

    expect(payload.birth_date).toBeNull();
    expect(payload.gender).toBeNull();
  });
});
